import gspread
from oauth2client.service_account import ServiceAccountCredentials

# use creds to create a client to interact with the Google Drive API
def get_gsheet_client():
    cli = None
    if not cli:
        scope = ['https://spreadsheets.google.com/feeds',
                'https://www.googleapis.com/auth/drive']
        creds = ServiceAccountCredentials.from_json_keyfile_name('utils/barefoot-dms-91bd8bd62100.json', scope)
        cli = gspread.authorize(creds)
    return cli

# Find a workbook by name and open the first sheet
# Make sure you use the right name here.
# Extract and print all of the values

def get_data_from_sheet(workbook = "Donors", sheet = "donor"):
    client = get_gsheet_client()
    wb = client.open(workbook)
    sheet = wb.worksheet(sheet)
    list_of_hashes = sheet.get_all_records()
    return (list_of_hashes)


def insert_data_in_sheet(data, workbook = "Donors", sheet = "donor"):
    client = get_gsheet_client()
    wb = client.open(workbook)
    sheet = wb.worksheet(sheet)
    row_to_insert = sheet.row_count + 1
    header_list = sheet.row_values(1)
    data_to_insert = [None] * len(header_list)
    for k,v in data.items():
        index = header_list.index(k.capitalize())
        data_to_insert[index] = v
    sheet.append_row(data_to_insert)        

def get_all_worksheet_name(workbook = "Donors"):
    client = get_gsheet_client()
    wb = client.open(workbook)
    worksheet_list = wb.worksheets()
    return worksheet_list

def update_row(workbook, sheet, cell_to_find, column_to_update, value):
    client = get_gsheet_client()
    wb = client.open(workbook)
    sheet = wb.worksheet(sheet)
    cell_row = sheet.find(cell_to_find)
    cell_column = sheet.find(column_to_update)
    cell_to_update = chr(cell_column.col+64) + str(cell_row.row) 
    sheet.update(cell_to_update,value)

def append_cell(workbook, sheet, cell_to_find, column_to_update, value):
    client = get_gsheet_client()
    wb = client.open(workbook)
    sheet = wb.worksheet(sheet)
    cell_row = sheet.find(cell_to_find)
    cell_column = sheet.find(column_to_update)
    cell_to_update = chr(cell_column.col+64) + str(cell_row.row) 
    val = sheet.get(cell_to_update).first()
    updated_value = value + ','+ val
    sheet.update(cell_to_update,updated_value)

def add_worksheet(workbook, sheet_name, column_names):
    client = get_gsheet_client()
    wb = client.open(workbook)
    worksheet = wb.add_worksheet(title=sheet_name, rows="100", cols="20")
    count = 1
    for name in column_names:
        cell_name = chr(64+count)+ str(1)
        worksheet.update(cell_name, name)
        count = count+1