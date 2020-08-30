from flask import Flask, render_template, request, jsonify
import ast
from utils import gsheet_utils, redis_utils, gcalendar_utils
from datetime import datetime
import requests
try:
    import urlparse
except ImportError:
    import urllib.parse as urlparse

app = Flask(__name__, static_folder="./../build/static", template_folder="./../build")
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

if __name__ == '__main__':
    app.run(host='127.0.0.1', debug=True)
    
@app.route("/add_donor/",  methods=['POST'])
def add_donor():
    str = request.data.decode('UTF-8')
    donor = ast.literal_eval(str).get('donor')
    gsheet_utils.insert_data_in_sheet(donor,workbook = "Donors", sheet="donor")
    persist_new_in_redis("Donors","donor")
    nets = (get_from_redis("Projects","Nets"))
    nets['Total_donation'] = float(nets['Total_donation'])+float(donor['amount'])
    persist_in_redis("Projects","Nets",nets)
    return "Success"

@app.route("/add_donor_list/",  methods=['POST'])
def append_to_donor_list():
    str = request.data.decode('UTF-8')
    donor = ast.literal_eval(str).get('data_donor_list')
    gsheet_utils.insert_data_in_sheet(donor,workbook = "Donors", sheet="donor_list")
    persist_new_in_redis("Donors","donor_list")
    return "Success"

@app.route("/add_expense/",  methods=['POST'])
def add_expense_for_project():
    str = request.data.decode('UTF-8')      
    expense = ast.literal_eval(str).get('expense')
    sheet_name = expense.get('projectName')
    del expense['projectName']
    gsheet_utils.insert_data_in_sheet(expense,workbook = "Projects", sheet=sheet_name)
    update_line_item_for_project(sheet_name)
    persist_new_in_redis("Projects",sheet_name)
    nets = (get_from_redis("Projects","Nets"))
    nets['Total_expenses'] = float(nets['Total_expenses'])+float(expense['Total_cost'])
    persist_in_redis("Projects","Nets",nets)

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
    if name == 'Nets':
        totalCost = 0
        dataSummary = gsheet_utils.get_data_from_sheet(workbook = "Projects", sheet="Summary")
        dataDonors = gsheet_utils.get_data_from_sheet(workbook = "Donors", sheet="donor")
        totalDonation = sum(float(item['Amount'].replace(",","") if isinstance(item['Amount'], str) else item['Amount']) for item in dataDonors)
        nDonors = gsheet_utils.get_data_from_sheet(workbook = "Donors", sheet="donor_list")
        nDonors = len(nDonors)
        totalBudget = sum(float(item['Budget'].replace(",","") if isinstance(item['Budget'], str) else item['Budget']) for item in dataSummary)
        for project in dataSummary:
            dataProject = gsheet_utils.get_data_from_sheet(workbook = "Projects", sheet=project['Project_name'])
            totalCost = totalCost + sum(float(item['Total_cost'].replace(",","") if isinstance(item['Total_cost'], str) else item['Total_cost']) for item in dataProject)
        data = {
            'Total_budget':totalBudget,
            'Total_expenses':totalCost,
            'Balance_amount':totalBudget-totalCost,
            'Target_amount':400000,
            'Total_donation':totalDonation,
            'n_donors':nDonors,
            'n_projects':len(dataSummary)
        }
        persist_in_redis("Projects",name,data)
        return jsonify(data)
    elif name == 'Report':
        final_report=[]
        summary_report = {}
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        dataSummary = gsheet_utils.get_data_from_sheet(workbook = "Projects", sheet="Summary")
        for project in dataSummary:
            dataProject = gsheet_utils.get_data_from_sheet(workbook = "Projects", sheet=project['Project_name'])
            for data in dataProject:
                d = datetime.strptime(data['Date'], '%d/%m/%Y')
                month = d.month
                year = str(d.year)
                year = year[2:]
                month_label = month_names[month-1]
                key = month_label+'-'+year
                if key not in summary_report:
                    summary_report[key]=0
                summary_report[key] = summary_report[key] + (float(data['Total_cost'].replace(",","")) if isinstance(data['Total_cost'], str) else data['Total_cost'])

        for k,v in summary_report.items():
            month = k[:3]
            month = month_names.index(month)
            year = k[4:]
            index= int(str(year)+str('0')+str(month))         
            processed_data = {
                k:v,
                'index':index
            }
            final_report.append(processed_data)
        final_data = sorted(final_report, key = lambda k:k['index'])
        persist_in_redis("Projects",name,final_data)
        return jsonify(final_data)
    else:
        data = gsheet_utils.get_data_from_sheet(workbook = "Projects", sheet=name)
        persist_in_redis("Projects",name,data)
        if name =='Summary':
            compute_line_item_for_projects()
        return jsonify(data)

@app.route("/get_line_item/",  methods=['GET'])
def get_line_items():
    name = request.args.get("name")
    return jsonify(get_from_redis("Lineitem",name))

def compute_line_item_for_projects():
    projectSummary = get_from_redis("Projects",'Summary')
    for project in projectSummary:
        dataProject = gsheet_utils.get_data_from_sheet(workbook = "Projects", sheet=project['Project_name'])
        projectName = project['Project_name']
        item_list = ['Food', 'Travel', 'Hardware/software','Office_supplies','Team_outing','Others']
        rem_list = ['Project_name', 'Budget', 'Status','Users','Progress','Class_name'] 
        class_names = ['fa fa-birthday-cake', 'fa fa-motorcycle', 'fa fa-briefcase', 'fa fa-folder-open', 'fa fa-map-signs','fa fa-rocket']
        [project.pop(key) for key in rem_list] 
        line_item_summary = []
        cost_list = {}
        for index,item in enumerate(item_list):
            temp = {
                'class_name': class_names[index],
                'item_name':item,
                'budget':project[item],
                'total_cost':0,
                'utilisation':0
            }
            line_item_summary.append(temp)
            cost_list[item]=0
        for cost in dataProject:
            item_name = cost['Item']
            if not item_name in cost_list:
                item_name='Others'
            cost_list[item_name] = cost_list[item_name]+float(cost['Total_cost'].replace(",","") if isinstance(cost['Total_cost'], str) else cost['Total_cost'])
        for item in line_item_summary:
            item['total_cost']=cost_list[item['item_name']]
            item['utilisation']=round((item['total_cost']/item['budget'])*100 if item['budget']!=0 else 100)
        persist_in_redis("Lineitem",projectName,line_item_summary)

def update_line_item_for_project(project_name):
    projectSummary = get_from_redis("Projects",'Summary')
    for project in projectSummary:
        if project['Project_name'] == project_name:
            dataProject = gsheet_utils.get_data_from_sheet(workbook = "Projects", sheet=project['Project_name'])
            projectName = project['Project_name']
            item_list = ['Food', 'Travel', 'Hardware/software','Office_supplies','Team_outing','Others']
            rem_list = ['Project_name', 'Budget', 'Status','Users','Progress','Class_name'] 
            class_names = ['fa fa-birthday-cake', 'fa fa-motorcycle', 'fa fa-briefcase', 'fa fa-folder-open', 'fa fa-map-signs','fa fa-rocket']
            [project.pop(key) for key in rem_list] 
            line_item_summary = []
            cost_list = {}
            for index,item in enumerate(item_list):
                temp = {
                    'class_name': class_names[index],
                    'item_name':item,
                    'budget':project[item],
                    'total_cost':0,
                    'utilisation':0
                }
                line_item_summary.append(temp)
                cost_list[item]=0
            for cost in dataProject:
                item_name = cost['Item']
                if not item_name in cost_list:
                    item_name='Others'
                cost_list[item_name] = cost_list[item_name]+float(cost['Total_cost'].replace(",","") if isinstance(cost['Total_cost'], str) else cost['Total_cost'])
            for item in line_item_summary:
                item['total_cost']=cost_list[item['item_name']]
                item['utilisation']=round((item['total_cost']/item['budget'])*100 if item['budget']!=0 else 100)
            persist_in_redis("Lineitem",projectName,line_item_summary)


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
    update_line_item_for_project(project_to_update)
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
                "phone":donor.get("Phone"),"purpose":donor.get("Projects"),"address":donor.get("Address"),"pan":donor.get("Pan"),"payment_mode":donor.get("Payment_mode"),"email":donor.get("email")}
    u = url + urlparse.urlencode(payload)
    response = requests.get(u)
    return (response.content).decode("utf-8") 

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
    column_names = ['Date','Item','Description','Quantity','Unit_cost','Total_cost','Created_by','Donors']
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