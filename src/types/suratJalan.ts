export interface SuratJalanItem {
  id: string;
  no: number;
  containerSeal: string;
  description: string;
  packageQty: string;
  weightKg: string;
  remarks: string;
}

export interface SuratJalanData {
  id: string;
  title: string;
  
  // Transport info
  unitType: string;
  driverName: string;
  phoneNo: string;
  licensePlate: string;
  
  // Shipper & Destination
  shipperName: string;
  shipperAddress: string;
  deliveryAddress: string;
  
  // Logistics Reference
  blNumber: string;
  poNumber: string;
  
  // Goods list
  items: SuratJalanItem[];
  
  // Dates
  deliveryDate: string;
  arrivedDate: string;
  dischargeDate: string;
  
  // Signatures
  driverSigner: string;
  nlsSigner: string;
  receiverSigner: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ShipperPreset {
  id: string;
  name: string;
  address: string;
}

export interface DriverPreset {
  id: string;
  name: string;
  phone: string;
  licensePlate: string;
  unitType: string;
}
