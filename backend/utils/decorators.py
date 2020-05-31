from flask import Response, render_template, request
import flask
import flask_login

def jsonify(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        ret = f(*args, **kwargs)
        # TODO(prathab): temp hack to avoid errors
        if isinstance(ret, Response):
            return ret
        elif isinstance(ret, schemas.base.ObjectBase):
            return flask.jsonify(ret.to_dict())
        return flask.jsonify(ret)
    return wrapped
