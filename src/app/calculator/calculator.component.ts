import { Component, OnInit } from '@angular/core';
declare var require: any
@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent implements OnInit {
  impuestos = [];
  totales = [];
  constructor() { }

  ngOnInit() {
  }

  onChangeFiles(files) {
    this.impuestos = [];
    this.totales = [];
    for (let i = 0; i < files.length; i++) {
      const fileReader: FileReader = new FileReader();

      fileReader.onloadend = (event: Event) => {
        this.parseXMLtoJSON(fileReader.result);
      };

      const file = files[i];
      let xml = fileReader.readAsText(file);
    }
  }
  
  parseXMLtoJSON(xml) {
    let parseString = require('xml2js').parseString;
    parseString(xml, (err, result) => {
      const complemento = result['cfdi:Comprobante']['cfdi:Complemento'][0];
      const deducciones = complemento['nomina12:Nomina'][0]['nomina12:Deducciones'][0]['nomina12:Deduccion']
      deducciones.forEach(item => {
        item['$'].FechaTimbrado = complemento['tfd:TimbreFiscalDigital'][0]['$'].FechaTimbrado;
        item['$'].UUID = complemento['tfd:TimbreFiscalDigital'][0]['$'].UUID;
        this.impuestos.push(item.$);
      });

      this.totales = this.sumImpuestos(this.impuestos);
    });
  }

  sumImpuestos(array) {
    var result = [];
    array.forEach(function (item, index) {
      if (!result[item.Clave]) {
        result[item.Clave] = {
          Clave: item.Clave,
          Concepto: item.Concepto,
          Importe: 0
        }
      }
      result[item.Clave].Importe += parseFloat(item.Importe);
    });

    for (let key in result) {
      const item = result[key];
      result.push(item);
    }

    return result;
  }
}
