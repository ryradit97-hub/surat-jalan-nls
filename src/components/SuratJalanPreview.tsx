import React from 'react';
import { SuratJalanData } from '../types/suratJalan';
import headerImg from '../source/logoheadernls.png';

interface SuratJalanPreviewProps {
  data: SuratJalanData;
  documentRef?: React.RefObject<HTMLDivElement | null>;
}

export const SuratJalanPreview: React.FC<SuratJalanPreviewProps> = ({ data, documentRef }) => {
  // Ensure table has at least 1 primary item displayed
  const displayItems = [...data.items];
  while (displayItems.length < 1) {
    displayItems.push({
      id: `empty-${displayItems.length}`,
      no: displayItems.length + 1,
      containerSeal: '',
      description: '',
      packageQty: '',
      weightKg: '',
      remarks: ''
    });
  }

  return (
    <div 
      ref={documentRef} 
      className="surat-jalan-document"
      id="surat-jalan-print-area"
    >
      {/* OFFICIAL NLS LOGISTIK HEADER IMAGE */}
      <div className="sj-header-banner-wrapper">
        <img 
          src={headerImg} 
          alt="PT Niaga Logistics Sejahtera" 
          className="sj-header-banner-img"
        />
      </div>

      {/* DOCUMENT TITLE */}
      <div className="sj-title">
        SURAT JALAN
      </div>

      {/* TOP METADATA & SHIPPER GRID */}
      <div className="sj-info-grid">
        <div className="sj-info-left">
          <div className="sj-info-row">
            <span className="sj-info-label">UNIT TYPE (Truck/Car) :</span>
            <span className="sj-info-val">{data.unitType}</span>
          </div>
          <div className="sj-info-row">
            <span className="sj-info-label">DRIVER NAME :</span>
            <span className="sj-info-val">{data.driverName}</span>
          </div>
          <div className="sj-info-row">
            <span className="sj-info-label">PHONE NO. :</span>
            <span className="sj-info-val">{data.phoneNo}</span>
          </div>
          <div className="sj-info-row">
            <span className="sj-info-label">LICENSE/No. Polisi :</span>
            <span className="sj-info-val">{data.licensePlate}</span>
          </div>
        </div>

        <div className="sj-info-right-box">
          <div className="sj-shipper-title">
            <strong>SHIPPER : {data.shipperName}</strong>
          </div>
          <div className="sj-shipper-address">
            {data.shipperAddress}
          </div>
          <div className="sj-delivery-title">
            <strong>DELIVERY ADDRESS:</strong>
          </div>
          <div className="sj-delivery-val">
            {data.deliveryAddress}
          </div>
        </div>
      </div>

      {/* MAIN CARGO TABLE */}
      <table className="sj-table">
        <thead>
          <tr className="sj-table-top-bar">
            <th colSpan={6} style={{ textAlign: 'left', padding: '7px 10px', fontSize: '11px', fontWeight: 'bold' }}>
              <span style={{ marginRight: '40px' }}>BL NUMBER : {data.blNumber}</span>
              {data.poNumber && <span>PO NUMBER : {data.poNumber}</span>}
            </th>
          </tr>
          <tr className="sj-table-headers">
            <th style={{ width: '40px' }}>NO.</th>
            <th style={{ width: '140px' }}>CONTAINER/SEAL</th>
            <th>
              DESCRIPTION OF GOODS<br />
              <span className="sub-header">(Nama Barang)</span>
            </th>
            <th style={{ width: '85px' }}>
              PACKAGE<br />
              <span className="sub-header">(QTY)</span>
            </th>
            <th style={{ width: '95px' }}>
              WEIGHT<br />
              <span className="sub-header">(KG)</span>
            </th>
            <th style={{ width: '105px' }}>
              REMARKS<br />
              <span className="sub-header">(Keterangan)</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {displayItems.map((item, idx) => (
            <tr key={item.id || idx} style={{ height: '220px' }}>
              <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                {item.containerSeal || item.description ? idx + 1 : ''}
              </td>
              <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '500', padding: '0 5px' }}>
                {item.containerSeal}
              </td>
              <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', padding: '0 10px' }}>
                {item.description}
              </td>
              <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                {item.packageQty}
              </td>
              <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '500' }}>
                {item.weightKg}
              </td>
              <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '500' }}>
                {item.remarks}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* DATES SECTION */}
      <div className="sj-dates-section">
        <div className="sj-date-row">
          <span className="sj-date-label">Delivery Date/Tanggal Kirim:</span>
          <span className="sj-date-val">{data.deliveryDate}</span>
        </div>
        <div className="sj-date-row">
          <span className="sj-date-label">Arrived Date/Tanggal Tiba:</span>
          <span className="sj-date-val">{data.arrivedDate}</span>
        </div>
        <div className="sj-date-row">
          <span className="sj-date-label">Discharge(Stuffing) Date/Tanggal Bongkar(Muat) :</span>
          <span className="sj-date-val">{data.dischargeDate}</span>
        </div>
      </div>

      {/* SIGNATURE SECTION */}
      <div className="sj-signatures">
        <div className="sj-sig-col">
          <div className="sj-sig-header">
            <div style={{ fontWeight: '700' }}>DRIVER/Supir:</div>
            <div style={{ fontSize: '10px', color: '#000' }}>(SIGN/Tanda Tangan)</div>
          </div>
          <div className="sj-sig-line"></div>
        </div>
        <div className="sj-sig-col">
          <div className="sj-sig-header">
            <div style={{ fontWeight: '700', fontSize: '11px' }}>NLS</div>
            <div style={{ fontSize: '10px', color: '#000', visibility: 'hidden' }} aria-hidden="true">(SIGN/Tanda Tangan)</div>
          </div>
          <div className="sj-sig-line"></div>
        </div>
        <div className="sj-sig-col">
          <div className="sj-sig-header">
            <div style={{ fontWeight: '700' }}>RECEIVED BY/Penerima:</div>
            <div style={{ fontSize: '10px', color: '#000' }}>(SIGN/Tanda Tangan)</div>
          </div>
          <div className="sj-sig-line"></div>
        </div>
      </div>
    </div>
  );
};
