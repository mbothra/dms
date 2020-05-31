import redis
import json
from functools import singledispatch
import inspect

redis_host = "localhost"
redis_port = 6379
redis_password = ""

def create_new_client():
    return redis.Redis(host=redis_host, port=redis_port, decode_responses=True)

def redis_client():
    if redis_client.client is None:
        redis_client.client = create_new_client()
    return redis_client.client

redis_client.client = None

def get(namespace, key):
    inner_key = get_inner_key(namespace, key)
    return redis_client().get(inner_key)

def set(namespace, key, value, timeout_seconds=None):
    if timeout_seconds is None:
        inner_key = get_inner_key(namespace, key)
        redis_client().set(inner_key, value)
    else:
        inner_key = get_inner_key(namespace, key)
        redis_client().setex(inner_key, timeout_seconds, value)

def get_object(namespace, key):
    value = get(namespace, key)
    if value:
        return json.loads(value)
    return None

def set_object(namespace, key, value, timeout_seconds=None):
    value = json.dumps(value, default=to_serializable)
    set(namespace, key, value, timeout_seconds=timeout_seconds)

@singledispatch
def to_serializable(val):
    if inspect.isclass(val) and hasattr(val, '__dict__'):
        return json.dumps(val.__dict__)
    return str(val)

def get_inner_key(namespace, key):
    return namespace + '::' + key

def get_all_keys():
    return redis_client().keys()

def delete_all_keys():
    keys = get_all_keys()
    for key in keys: redis_client().delete(key)


