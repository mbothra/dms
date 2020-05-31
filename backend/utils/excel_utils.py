import xlrd
import os
import xlwt import Workbook
from xlutils.copy import copy

def insert_row_in_excel(excelName, sheetName, data):
    dir_loc = os.path.abspath('../excels/',excelName)
    xls_loc = os.path.join(dir_loc)
    workbook = openpyxl.load_workbook('sheets.xlsx')
    print(book.get_sheet_names())
    sheet = book.get_sheet_by_name(sheetName)
    sheet.append(data)
    workbook.save(excelName)

