import { SuratJalanData, ShipperPreset, DriverPreset } from '../types/suratJalan';

export const defaultDeliveryAddresses: string[] = [
  'Terminal Peti Kemas Koja (UTC3)',
  'Terminal Petikemas Bitung (TPK Bitung)',
  'PT Terminal Mustika Alam Lestari',
  'New Priok Container Terminal One (NPCT1)',
  'JAKARTA INTERNATIONAL CONTAINER TERMINAL'
];

export const defaultShippers: ShipperPreset[] = [
  {
    id: 'ship-1',
    name: 'PT. FOOD PACKAGING JAYA',
    address: 'A16-18 KAWASAN INDUSTRI WIRATAMA MUNTUR LOSARANG KAB. INDRAMAYU JAWA BARAT 45253'
  },
  {
    id: 'ship-2',
    name: 'PT COTTI COFFEE INDONESIA',
    address: 'Jalan Worang By Pass, Desa/Kelurahan Tumaluntung, Kecamatan Kauditan, Kabupaten Minahasa Utara, Provinsi Sulawesi Utara'
  }
];

export const createEmptySuratJalan = (): SuratJalanData => ({
  id: 'SJ-' + Date.now().toString().slice(-6),
  title: 'Surat Jalan Trailer 40ft',
  unitType: 'Trailer 40ft',
  driverName: '',
  phoneNo: '',
  licensePlate: '',
  shipperName: 'PT. FOOD PACKAGING JAYA',
  shipperAddress: 'A16-18 KAWASAN INDUSTRI WIRATAMA MUNTUR LOSARANG KAB. INDRAMAYU JAWA BARAT 45253',
  deliveryAddress: 'PT Terminal Mustika Alam Lestari',
  blNumber: 'JKTG58923800',
  poNumber: 'MDL-2643957',
  items: [
    {
      id: 'item-1',
      no: 1,
      containerSeal: '',
      description: 'PLASTIC KITCHEN WARE',
      packageQty: '',
      weightKg: '8732,5',
      remarks: '1 X 40 HC'
    }
  ],
  deliveryDate: '14 Sep 2026',
  arrivedDate: '',
  dischargeDate: '',
  driverSigner: '',
  nlsSigner: 'NLS',
  receiverSigner: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const defaultDrivers: DriverPreset[] = [
  {
    id: 'drv-1',
    name: 'Ahmad Supardi',
    phone: '0812-9876-5432',
    licensePlate: 'B 9876 UIX',
    unitType: 'Trailer 40ft'
  },
  {
    id: 'drv-2',
    name: 'Budi Santoso',
    phone: '0857-1122-3344',
    licensePlate: 'B 9123 NLS',
    unitType: 'Tronton Wingbox'
  }
];
