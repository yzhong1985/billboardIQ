import React, { useState } from 'react';
import { BiShow } from "react-icons/bi";

function BillboardLocationsPanel({ onToggleBillboards }) {

    const IntroContent = "Billboard advertising comes in various forms. Digital billboards, bulletins, shelters, " + 
                          "and benches are the most common types of billboards. Each has advantages and disadvantages. " +
                          "These are often rented on a monthly basis, with pricing varying based on demand, location, " +
                          "and billboard quality. ";

    const SummaryContent = "When considering outdoor advertising options, it's essential to align the medium with the " + 
                            "campaign's goals. If brand awareness across a broad demographic is the objective, bulletins " + 
                            "(include digital and traditional ) might be best. Conversely, for a localized campaign or " + 
                            "promotion, shelters or benches might be more appropriate.";

    const onToggleBillboardClick = () => {
      onToggleBillboards();
    };

    return (
        <div className='biq-bb-tab-container'>
          <div className='biq-bb-title-div'>Billboard Advertising: The Power of Outdoor Visibility</div>
          <div className='biq-bb-content-div'>{IntroContent}</div>
          <div className='biq-bb-btns-div'>
              <button onClick={onToggleBillboardClick}><BiShow />&nbsp;Toggle Billboard Locations</button>
          </div>
          <div className='biq-bb-billboard-types-div'>
            <div className='billboard-type'>
              <img src='../img/digital_billboads.png' alt="Digital billboards"></img>
              <div>Digital billboards</div>
            </div>
            <div className='billboard-type'>
              <img src='../img/bulletin_billboards.png' alt="Bulletin billboards"></img>
              <div>Bulletin billboards</div>
            </div>
            <div className='billboard-type'>
              <img src='../img/shelter_billboards.png' alt="Shelter billboards"></img>
              <div>Shelter billboards</div>
            </div>
            <div className='billboard-type'>
              <img src='../img/bench_billboards.png' alt="Bench billboards"></img>
              <div>Bench billboards</div>
            </div>
          </div>
          <div className='biq-bb-content-div'>{SummaryContent}</div>
        </div>
      );
    }

export default BillboardLocationsPanel;