from flask import Flask, render_template, request, jsonify
import ast
from utils import gsheet_utils, redis_utils, gcalendar_utils
from datetime import datetime
import requests
import urllib.parse

app = Flask(__name__, static_folder="/Users/muditbothra/Downloads/barefoot-dashboard/build/static", template_folder="/Users/muditbothra/Downloads/barefoot-dashboard/build")
# cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/")
@app.route("/admin/dashboard")
@app.route("/admin/projects")
@app.route("/admin/maps")
@app.route("/admin/user-profile")
def hello():    
    return render_template('index.html')
print('new Flask!')
app.debug=True
app.run(host='127.0.0.1')

@app.route("/add_donor/",  methods=['POST'])
def add_donor():
    str = request.data.decode('UTF-8')
    donor = ast.literal_eval(str).get('donor')
    gsheet_utils.insert_data_in_sheet(donor,workbook = "Donors", sheet="donor")
    persist_new_in_redis("Donors","donor")
    return "Success"

@app.route("/add_expense/",  methods=['POST'])
def add_expense_for_project():
    str = request.data.decode('UTF-8')      
    expense = ast.literal_eval(str).get('expense')
    sheet_name = expense.get('projectName')
    del expense['projectName']
    gsheet_utils.insert_data_in_sheet(expense,workbook = "Projects", sheet=sheet_name)
    persist_new_in_redis("Projects",sheet_name)
    return "Success"

@app.route("/get_donor/",  methods=['GET'])
def get_donor():
    if get_from_redis("Donors","donor"):
        return jsonify(get_from_redis("Donors","donor"))
    data = gsheet_utils.get_data_from_sheet(workbook = "Donors", sheet="donor")
    persist_in_redis("Donors","donor",data)
    return jsonify(data)

@app.route("/get_donor_sheet/",  methods=['GET'])
def get_donor_sheet():
    name = request.args.get("name")
    if get_from_redis("Donors",name):
        return jsonify(get_from_redis("Donors",name))
    data = gsheet_utils.get_data_from_sheet(workbook = "Donors", sheet=name)
    persist_in_redis("Donors",name,data)
    return jsonify(data)

@app.route("/get_summary/",  methods=['GET'])
def get_project():
    name = request.args.get("name")
    print(name)
    if get_from_redis("Projects",name):
        return jsonify(get_from_redis("Projects",name))
    data = gsheet_utils.get_data_from_sheet(workbook = "Projects", sheet=name)
    persist_in_redis("Projects",name,data)
    return jsonify(data)

@app.route("/get_all_project/",  methods=['GET'])
def get_all_project_name():
    if get_from_redis("Projects","name"):
        return jsonify(get_from_redis("Projects","name"))
    data = gsheet_utils.get_all_worksheet_name(workbook = "Projects")
    worksheet_names = [d.title for d in data]
    persist_in_redis("Projects","name",worksheet_names)
    return jsonify(worksheet_names)

@app.route("/update_project_details/",  methods=['POST'])
def update_project_row():
    str = request.data.decode('UTF-8')
    data = ast.literal_eval(str).get('data')
    project_to_update = data['projectName']
    key_to_update = data['key']

    value_to_update = data['value']
    type = data['type']
    if type == 'N':
        value_to_update = float(value_to_update)
    data = gsheet_utils.update_row(workbook = "Projects",sheet="Summary",cell_to_find=project_to_update,column_to_update = key_to_update, value = value_to_update)
    if key_to_update == 'Progress':
        if value_to_update < 30:
            cname = 'bg-danger'
        elif value_to_update <90:
            cname='bg-info'
        else:
            cname = 'bg-success'
        data = gsheet_utils.update_row(workbook = "Projects",sheet="Summary",cell_to_find=project_to_update,column_to_update = 'Class_name', value = cname)

    persist_new_in_redis("Projects", "Summary")
    return "Success"

@app.route("/update_user/",  methods=['POST'])
def append_project_Cell():
    str = request.data.decode('UTF-8')
    data = ast.literal_eval(str).get('data')
    project_to_update = data['projectName']
    key_to_update = data['key']
    value_to_update = data['value']
    type = data['type']
    if type == 'N':
        value_to_update = float(value_to_update)
    data = gsheet_utils.append_cell(workbook = "Projects",sheet="Summary",cell_to_find=project_to_update,column_to_update = key_to_update, value = value_to_update)
    persist_new_in_redis("Projects","Summary")
    return "Success"

@app.route("/download_donor_receipt/",  methods=['POST'])
def download_pdf_donor_receipt():
    str = request.data.decode('UTF-8')
    donor = ast.literal_eval(str).get('donor')
    url = "https://script.google.com/macros/s/AKfycbyEjTF6qA8lpeBT-Aajp2OVoE3c0yVvM14vSnB-OcLyH80U4Uk/exec?"

    payload = {"name": donor.get('Name'),"date":donor.get("Date"),"amount":donor.get("Amount"),
                "phone":donor.get("Phone"),"purpose":donor.get("Projects"),"address":donor.get("Address"),"pan":donor.get("Pan")}
    u = url + urllib.parse.urlencode(payload)
    response = requests.get(u)
    response = requests.get(response.content)
    with open("Donation Receipt-{}.pdf".format(donor.get('Name')), "wb") as f:
        f.write(response.content)
    return "Success"

def persist_in_redis(ns, key, data):
    return redis_utils.set_object(ns, key, data)

def get_from_redis(ns, key):
    return redis_utils.get_object(ns,key)

def persist_new_in_redis(ns, key):
    data = gsheet_utils.get_data_from_sheet(workbook = ns, sheet=key)
    redis_utils.set_object(ns, key, data)

@app.route("/reload_data/",  methods=['GET'])
def reload_data():
    redis_utils.delete_all_keys()
    return render_template('index.html')

@app.route("/add_project/",  methods=['POST'])
def add_project():
    str = request.data.decode('UTF-8')
    project_data = ast.literal_eval(str).get('project')
    project_data['class_name'] = 'bg-danger'
    project_data['status'] = 'Pending'
    gsheet_utils.insert_data_in_sheet(project_data,workbook = "Projects", sheet="Summary")
    print(project_data)
    donor_sheet_data = {
        'project_name':project_data['project_name']
    }

    gsheet_utils.insert_data_in_sheet(donor_sheet_data,workbook = "Donors", sheet="projects")
    column_names = ['Date','Item','Description','Quantity','Unit_cost','Total_cost','Created_by']
    gsheet_utils.add_worksheet('Projects',project_data['project_name'],column_names)
    
    persist_new_in_redis("Donors","projects")
    persist_new_in_redis("Projects","Summary")
    return "Success"

@app.route("/get_calendar_events/",  methods=['GET'])
def get_calendar_events():
    print("Inside")
    events = gcalendar_utils.get_events()
    print(events)
    return jsonify(events)

@app.route("/add_calendar_event/",  methods=['POST'])
def add_calendar_events():
    print("Inside")
    str = request.data.decode('UTF-8')
    event_data = ast.literal_eval(str).get('event')
    print(ast.literal_eval(str))
    gcalendar_utils.create_event(event_data['startDate'],event_data['endDate'],event_data['eventName'])
    return "Success"