import React, { useState } from 'react';

function BillboardLocationsPanel({ onToggleBillboard }) {

    const onToggleBillboardClick = () => {
        //onTurnOffBillboards();
        console.log("BillboardLocationsPanel -- ");
        onToggleBillboard();
    };

    return (
        <div>
          <button onClick={onToggleBillboardClick}>Toggle Candidate Billboards Layer</button>
        </div>
      );
    }

export default BillboardLocationsPanel;