from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

app = FastAPI()

logging.basicConfig(filename='backend.log', level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SalaryInput(BaseModel):
    year_basic_pay: float
    pension_percent: float
    sharematch: float
    holidays: int
    other_gross_deductions: float
    sharesave: float
    other_net_deductions: float

@app.post("/calculate")
def calculate(data: SalaryInput):
    # Helper functions
    def calc_pension(sal, percent):
        month_sal = sal / 12
        pension = month_sal * (percent / 100)
        pension_total = pension * 12
        return round(pension, 2), pension_total

    def calc_holidays(sal, holidays):
        hourly_rate = sal / 1820 # Assuming 1820 hours in a year
        annual_holiday_pay = hourly_rate * holidays
        month_holiday_pay = annual_holiday_pay / 12
        return round(month_holiday_pay, 2)

    def calc_national_insurance(sal):
        month_sal = sal / 12
        if month_sal <= 1048:
            return 0
        else:
            if month_sal <= 4189:
                nat_ins = (month_sal - 1048) * 0.08
            else:
                nat_ins = (4189 - 1048) * 0.08 + (month_sal - 4189) * 0.02
            return round(nat_ins, 2)

    def calc_tax_under_100k_sal(sal):
        if sal <= 12570:
            return 0
        else:
            if sal <= 50270:
                tax = (sal - 12570) * 0.2
            else:
                tax = (50270 - 12570) * 0.2 + (sal - 50270) * 0.4
        return round(tax / 12, 2)

    def calc_tax_over_100k_sal(sal):
        personal_allowance = 12570
        reduction = (sal - 100000) / 2
        personal_allowance -= reduction
        personal_allowance = max(0, personal_allowance)

        if sal <= 125140:
            tax = (50270 - personal_allowance) * 0.2 + (sal - 50270) * 0.4
        else:
            tax = (50270 - personal_allowance) * 0.2 + (125140 - 50270) * 0.4 + (sal - 125140) * 0.45
        return round(tax / 12, 2)

    def calc_ug_student_loan(sal):
        if sal < 28470:
            return 0
        else:
            usl = (sal - 28470) * 0.09
            return round(usl / 12, 2)

    def calc_pg_student_loan(sal):
        if sal < 21000:
            return 0
        else:
            psl = (sal - 21000) * 0.06
            return round(psl / 12, 2)

    # Calculations
    month_basic_pay = data.year_basic_pay / 12
    pension, pension_total = calc_pension(data.year_basic_pay, data.pension_percent)
    sharematch = data.sharematch
    holidays = calc_holidays(data.year_basic_pay, data.holidays)
    print(f"Holidays Pay: {holidays}")
    gross_before_deductions = month_basic_pay - (pension + sharematch + holidays + data.other_gross_deductions)
    month_gross_salary = gross_before_deductions
    print(f"Gross Salary Before Deductions: {month_gross_salary}")
    year_gross_salary = month_gross_salary * 12

    ni = calc_national_insurance(year_gross_salary)
    if year_gross_salary > 100000:
        tax = calc_tax_over_100k_sal(year_gross_salary)
    else:
        tax = calc_tax_under_100k_sal(year_gross_salary)
    usl = calc_ug_student_loan(year_gross_salary)
    psl = calc_pg_student_loan(year_gross_salary)

    sharesave = data.sharesave

    deductions = ni + tax + usl + psl + sharesave + data.other_net_deductions
    month_net_salary = month_gross_salary - deductions

    return {
        "gross_salary": {
            "Basic Yearly Pay": data.year_basic_pay,
            "Basic Monthly Pay": month_basic_pay,
            "Pension": pension,
            "Sharematch": sharematch,
            "Holidays": holidays,
            "Gross Salary": month_gross_salary
        },
        "take_home_pay": {
            "National Insurance": ni,
            "Tax": tax,
            "Undergrad Student Loan": usl,
            "Postgrad Student Loan": psl,
            "Sharesave": sharesave,
            "Other Net Deductions": data.other_net_deductions,
            "Total Deductions": deductions,
            "Monthly Take Home Pay": round(month_net_salary, 2)
        }
    }