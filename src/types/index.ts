export interface TableRow {
  [key: string]: string;
}

export interface TableData {
  headers: string[];
  rows: TableRow[];
}

export interface SelectOption {
  value: string | null;
  label: string | null;
}

export interface HsnCodeForm {
  selectedValues: string[];
  hsnCode: string;
}

export interface TableDataType {
  headers: string[];
  rows: {
    Srno: string;
    Addr : string;
Batch : string;
Date : string;
Doctor : string;
DoctorTelephone : string;
HSNCode : string;
Patient : string;
PatientMobile : string;
Product : string;
Qty : string;
SrNo : string;
Unit : string;
VchNo : string;
  }[]
}