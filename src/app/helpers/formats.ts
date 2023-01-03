export class FormatsHelper {

  constructor() {}

  formatNumber(value, separator = ',', decimal = '.', fiat = '$', decimals = 4): string {
    if (!value) return 'n/a';
    try {
      const values = parseFloat(value).toFixed(decimals).toString().replace(/^-/, '').split('.');
      const dollars = values[0];
      const cents = decimals ? values[1] : 0;
      const groups = /(\d)(?=(\d{3})+\b)/g;
      let formatted = `${'#'.replace(
        '#',
        `${dollars.replace(groups, `$1${separator}`)}${cents ? decimal + cents : ''}`,
      )}`;

      if(fiat) {
        formatted =`${formatted}  ${fiat}`;
      }

      return formatted;
    } catch (e) {
      return value === undefined ? '-' : value;
    }
  };

  formatBigNumber(num, digits) {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "B" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup.slice().reverse().find(function(item) {
      return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
  }
  
}