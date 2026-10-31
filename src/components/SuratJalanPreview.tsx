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
      style={{
        width: '794px',
        minHeight: '1123px',
        padding: '38px 57px 45px 57px',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
        boxSizing: 'border-box',
        position: 'relative',
        WebkitTextSizeAdjust: '100%',
      }}
    >
      {/* OFFICIAL NLS LOGISTIK HEADER IMAGE */}
      <div
        className="sj-header-banner-wrapper"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-start',
          marginBottom: '13.6px',
        }}
      >
        <img 
          src={headerImg} 
          alt="PT Niaga Logistics Sejahtera" 
          className="sj-header-banner-img"
          style={{
            height: '70px',
            width: 'auto',
            maxWidth: '280px',
            display: 'block',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* DOCUMENT TITLE */}
      <div
        className="sj-title"
        style={{
          textAlign: 'center',
          fontSize: '21px',
          fontWeight: 900,
          letterSpacing: '0px',
          textDecoration: 'underline',
          marginBottom: '25.6px',
          marginTop: '8px',
          color: '#000000',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        SURAT JALAN
      </div>

      {/* TOP METADATA & SHIPPER GRID */}
      <div
        className="sj-info-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          marginBottom: '20px',
          fontSize: '11px',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div
          className="sj-info-left"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            className="sj-info-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '155px 1fr',
              gap: '4px',
            }}
          >
            <span className="sj-info-label" style={{ fontWeight: 400, color: '#000000' }}>UNIT TYPE (Truck/Car) :</span>
            <span className="sj-info-val" style={{ fontWeight: 400, color: '#000000' }}>{data.unitType}</span>
          </div>
          <div
            className="sj-info-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '155px 1fr',
              gap: '4px',
            }}
          >
            <span className="sj-info-label" style={{ fontWeight: 400, color: '#000000' }}>DRIVER NAME :</span>
            <span className="sj-info-val" style={{ fontWeight: 400, color: '#000000' }}>{data.driverName}</span>
          </div>
          <div
            className="sj-info-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '155px 1fr',
              gap: '4px',
            }}
          >
            <span className="sj-info-label" style={{ fontWeight: 400, color: '#000000' }}>PHONE NO. :</span>
            <span className="sj-info-val" style={{ fontWeight: 400, color: '#000000' }}>{data.phoneNo}</span>
          </div>
          <div
            className="sj-info-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '155px 1fr',
              gap: '4px',
            }}
          >
            <span className="sj-info-label" style={{ fontWeight: 400, color: '#000000' }}>LICENSE/No. Polisi :</span>
            <span className="sj-info-val" style={{ fontWeight: 400, color: '#000000' }}>{data.licensePlate}</span>
          </div>
        </div>

        <div
          className="sj-info-right-box"
          style={{
            border: '1px solid #000000',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            minHeight: '105px',
            boxSizing: 'border-box',
          }}
        >
          <div className="sj-shipper-title" style={{ fontSize: '11px', color: '#000000' }}>
            <strong>SHIPPER : {data.shipperName}</strong>
          </div>
          <div
            className="sj-shipper-address"
            style={{
              fontSize: '10.5px',
              lineHeight: 1.35,
              whiteSpace: 'pre-line',
              color: '#000000',
            }}
          >
            {data.shipperAddress}
          </div>
          <div className="sj-delivery-title" style={{ fontSize: '11px', marginTop: '4px', color: '#000000' }}>
            <strong>DELIVERY ADDRESS:</strong>
          </div>
          <div className="sj-delivery-val" style={{ fontSize: '11px', fontWeight: 400, color: '#000000' }}>
            {data.deliveryAddress}
          </div>
        </div>
      </div>

      {/* MAIN CARGO TABLE */}
      <table
        className="sj-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '2px solid #000000',
          marginBottom: '20px',
          fontSize: '11px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#000000',
        }}
      >
        <thead>
          <tr className="sj-table-top-bar">
            <th
              colSpan={6}
              style={{
                border: '1px solid #000000',
                textAlign: 'left',
                padding: '7px 10px',
                fontSize: '11px',
                fontWeight: 'bold',
                backgroundColor: '#ffffff',
                color: '#000000',
              }}
            >
              <span style={{ marginRight: '40px' }}>BL NUMBER : {data.blNumber}</span>
              {data.poNumber && <span>PO NUMBER : {data.poNumber}</span>}
            </th>
          </tr>
          <tr className="sj-table-headers">
            <th style={{ width: '40px', border: '1px solid #000000', padding: '6px 8px', fontWeight: 700, textAlign: 'center', backgroundColor: '#ffffff', color: '#000000' }}>NO.</th>
            <th style={{ width: '140px', border: '1px solid #000000', padding: '6px 8px', fontWeight: 700, textAlign: 'center', backgroundColor: '#ffffff', color: '#000000' }}>CONTAINER/SEAL</th>
            <th style={{ border: '1px solid #000000', padding: '6px 8px', fontWeight: 700, textAlign: 'center', backgroundColor: '#ffffff', color: '#000000' }}>
              DESCRIPTION OF GOODS<br />
              <span className="sub-header" style={{ fontWeight: 400, fontSize: '9.5px' }}>(Nama Barang)</span>
            </th>
            <th style={{ width: '85px', border: '1px solid #000000', padding: '6px 8px', fontWeight: 700, textAlign: 'center', backgroundColor: '#ffffff', color: '#000000' }}>
              PACKAGE<br />
              <span className="sub-header" style={{ fontWeight: 400, fontSize: '9.5px' }}>(QTY)</span>
            </th>
            <th style={{ width: '95px', border: '1px solid #000000', padding: '6px 8px', fontWeight: 700, textAlign: 'center', backgroundColor: '#ffffff', color: '#000000' }}>
              WEIGHT<br />
              <span className="sub-header" style={{ fontWeight: 400, fontSize: '9.5px' }}>(KG)</span>
            </th>
            <th style={{ width: '105px', border: '1px solid #000000', padding: '6px 8px', fontWeight: 700, textAlign: 'center', backgroundColor: '#ffffff', color: '#000000' }}>
              REMARKS<br />
              <span className="sub-header" style={{ fontWeight: 400, fontSize: '9.5px' }}>(Keterangan)</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {displayItems.map((item, idx) => (
            <tr key={item.id || idx} style={{ height: '220px' }}>
              <td style={{ border: '1px solid #000000', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', color: '#000000' }}>
                {item.containerSeal || item.description ? idx + 1 : ''}
              </td>
              <td style={{ border: '1px solid #000000', padding: '6px 5px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '500', color: '#000000' }}>
                {item.containerSeal}
              </td>
              <td style={{ border: '1px solid #000000', padding: '6px 10px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', color: '#000000' }}>
                {item.description}
              </td>
              <td style={{ border: '1px solid #000000', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', color: '#000000' }}>
                {item.packageQty}
              </td>
              <td style={{ border: '1px solid #000000', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '500', color: '#000000' }}>
                {item.weightKg}
              </td>
              <td style={{ border: '1px solid #000000', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '500', color: '#000000' }}>
                {(item.remarks ?? '').replace(/40\s*[-]?\s*HR/gi, '40 HC')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* DATES SECTION */}
      <div
        className="sj-dates-section"
        style={{
          fontSize: '11px',
          marginTop: '16px',
          marginBottom: '56px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#000000',
        }}
      >
        <div className="sj-date-row" style={{ display: 'grid', gridTemplateColumns: '260px 1fr' }}>
          <span className="sj-date-label" style={{ fontWeight: 400, color: '#000000' }}>Delivery Date/Tanggal Kirim:</span>
          <span className="sj-date-val" style={{ fontWeight: 400, color: '#000000' }}>{data.deliveryDate}</span>
        </div>
        <div className="sj-date-row" style={{ display: 'grid', gridTemplateColumns: '260px 1fr' }}>
          <span className="sj-date-label" style={{ fontWeight: 400, color: '#000000' }}>Arrived Date/Tanggal Tiba:</span>
          <span className="sj-date-val" style={{ fontWeight: 400, color: '#000000' }}>{data.arrivedDate}</span>
        </div>
        <div className="sj-date-row" style={{ display: 'grid', gridTemplateColumns: '260px 1fr' }}>
          <span className="sj-date-label" style={{ fontWeight: 400, color: '#000000' }}>Discharge(Stuffing) Date/Tanggal Bongkar(Muat) :</span>
          <span className="sj-date-val" style={{ fontWeight: 400, color: '#000000' }}>{data.dischargeDate}</span>
        </div>
      </div>

      {/* SIGNATURE SECTION */}
      <div
        className="sj-signatures"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          textAlign: 'center',
          fontSize: '11px',
          marginTop: '32px',
          alignItems: 'stretch',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#000000',
        }}
      >
        <div
          className="sj-sig-col"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            className="sj-sig-header"
            style={{
              minHeight: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            <div style={{ fontWeight: '700', color: '#000000' }}>DRIVER/Supir:</div>
            <div style={{ fontSize: '10px', color: '#000000' }}>(SIGN/Tanda Tangan)</div>
          </div>
          <div
            className="sj-sig-line"
            style={{
              marginTop: '70px',
              borderBottom: '1px solid #000000',
              width: '85%',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          ></div>
        </div>
        <div
          className="sj-sig-col"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            className="sj-sig-header"
            style={{
              minHeight: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            <div style={{ fontWeight: '700', fontSize: '11px', color: '#000000' }}>NLS</div>
            <div style={{ fontSize: '10px', color: '#000000', visibility: 'hidden' }} aria-hidden="true">(SIGN/Tanda Tangan)</div>
          </div>
          <div
            className="sj-sig-line"
            style={{
              marginTop: '70px',
              borderBottom: '1px solid #000000',
              width: '85%',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          ></div>
        </div>
        <div
          className="sj-sig-col"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            className="sj-sig-header"
            style={{
              minHeight: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            <div style={{ fontWeight: '700', color: '#000000' }}>RECEIVED BY/Penerima:</div>
            <div style={{ fontSize: '10px', color: '#000000' }}>(SIGN/Tanda Tangan)</div>
          </div>
          <div
            className="sj-sig-line"
            style={{
              marginTop: '70px',
              borderBottom: '1px solid #000000',
              width: '85%',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
