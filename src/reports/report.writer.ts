import { CacheState, ReportType, WriteResult } from './libs/report.type';
import fs from 'fs';

export abstract class ReportWriteStrategy {
  constructor(
    protected readonly type: ReportType,
    protected readonly cache: CacheState,
  ) {}
  abstract write(): WriteResult;
}

export class AccountsReportGenerationStrategy extends ReportWriteStrategy {
  write(): WriteResult {
    const start = performance.now();
    const output = ['Account,Balance'];
    const balances: Record<string, number> = {};
    for (const { balance, account } of Object.values(
      this.cache.data.balances,
    )) {
      balances[account] = (balances[account] || 0) + balance;
    }
    for (const [account, balance] of Object.entries(balances)) {
      output.push(`${account},${balance.toFixed(2)}`);
    }
    fs.writeFileSync('out/accounts.csv', output.join('\n'));
    const end = performance.now();
    const writeTime = (end - start) / 1000;
    return { writeTimeTaken: writeTime, filePath: 'out/accounts.csv' };
  }
}

export class YearlyReportGenerationStrategy extends ReportWriteStrategy {
  write(): WriteResult {
    const start = performance.now();
    const output = ['Financial Year,Cash Balance'];
    const cashByYear: Record<string, number> = {};
    for (const { year, account, balance } of Object.values(
      this.cache.data.balances,
    )) {
      if (account === 'Cash') {
        cashByYear[year] = (cashByYear[year] || 0) + balance;
      }
    }
    Object.keys(cashByYear)
      .sort()
      .forEach((year) => {
        output.push(`${year},${cashByYear[year].toFixed(2)}`);
      });
    fs.writeFileSync('out/yearly.csv', output.join('\n'));
    const end = performance.now();
    const writeTime = (end - start) / 1000;
    return {
      writeTimeTaken: writeTime,
      filePath: 'out/yearly.csv',
    };
  }
}

export class FSReportGenerationStrategy extends ReportWriteStrategy {
  private balanceByAccount: Record<string, number> = {};
  write(): WriteResult {
    const start = performance.now();
    for (const { account, balance } of Object.values(
      this.cache.data.balances,
    )) {
      this.balanceByAccount[account] =
        (this.balanceByAccount[account] || 0) + balance;
    }

    const output = `Basic Financial Statement

${this.buildIncomeStatement()}

${this.buildBalanceStatement()}`;
    fs.writeFileSync('out/fs.csv', output);
    const end = performance.now();
    const writeTime = (end - start) / 1000;
    return { writeTimeTaken: writeTime, filePath: 'out/fs.csv' };
  }

  private buildIncomeStatement(): string {
    const expenses = [
      'Cost of Goods Sold',
      'Salaries Expense',
      'Rent Expense',
      'Utilities Expense',
      'Interest Expense',
      'Tax Expense',
    ];
    const revenues = ['Sales Revenue'];
    const totalRevenues = revenues.reduce(
      (sum, r) => sum + (this.balanceByAccount[r] || 0),
      0,
    );
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + (this.balanceByAccount[e] || 0),
      0,
    );
    const netIncome = totalRevenues - totalExpenses;
    const income = `Income Statement
${revenues.map((r) => `${r},${(this.balanceByAccount[r] || 0).toFixed(2)}`).join('\n')}
${expenses.map((e) => `${e},${(this.balanceByAccount[e] || 0).toFixed(2)}`).join('\n')}
Net Income,${netIncome.toFixed(2)}`;
    return income;
  }

  private buildBalanceStatement(): string {
    const assets = [
      'Cash',
      'Accounts Receivable',
      'Inventory',
      'Fixed Assets',
      'Prepaid Expenses',
    ];
    const liabilities = [
      'Accounts Payable',
      'Loan Payable',
      'Sales Tax Payable',
      'Accrued Liabilities',
      'Unearned Revenue',
      'Dividends Payable',
    ];
    const equity = ['Common Stock', 'Retained Earnings'];
    const totalAssets = assets.reduce(
      (sum, a) => sum + (this.balanceByAccount[a] || 0),
      0,
    );
    const totalLiabilities = liabilities.reduce(
      (sum, l) => sum + (this.balanceByAccount[l] || 0),
      0,
    );
    const totalEquity = equity.reduce(
      (sum, e) => sum + (this.balanceByAccount[e] || 0),
      0,
    );
    const balanceSheet = `Balance Sheet
${assets.map((a) => `${a},${(this.balanceByAccount[a] || 0).toFixed(2)}`).join('\n')}
Total Assets,${totalAssets.toFixed(2)}

${liabilities.map((l) => `${l},${(this.balanceByAccount[l] || 0).toFixed(2)}`).join('\n')}
Total Liabilities,${totalLiabilities.toFixed(2)}

${equity.map((e) => `${e},${(this.balanceByAccount[e] || 0).toFixed(2)}`).join('\n')}
Total Equity,${(totalAssets - totalLiabilities).toFixed(2)}

Assets = Liabilities + Equity, ${totalAssets.toFixed(2)} = ${(totalLiabilities + totalEquity).toFixed(2)}`;
    return balanceSheet;
  }
}
