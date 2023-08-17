import React, { useState } from 'react';

function BillboardSettingsPanel({onSelectBillboards}) {
    
    const [type, setType] = useState('a');
    const [demand, setDemand] = useState('d');
    const [pricing, setPricing] = useState('p');
    const [numberOfBillboards, setNumberOfBillboards] = useState(1);
    const [radius, setRadius] = useState(1);

    const onSubmitClick = () => {
      const params = {
        name: "user",
        address: "123 Main St.",
      };
      onSelectBillboards(params);
    };

    return (
        <div>
          <div className='billboard-settings-label'>
            <label htmlFor="type">Type:</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="food">food</option>
              <option value="auto">auto services</option>
              <option value="home">home services</option>
            </select>
          </div>
    
          <div className='billboard-settings-label'>
            <label htmlFor="demand">Demand field:</label>
            <select id="demand" value={demand} onChange={(e) => setDemand(e.target.value)}>
              <option value="review_count">review counts</option>
              <option value="count_ratings">counts + ratings</option>
              <option value="others">others</option>
            </select>
          </div>

          <div className='billboard-settings-label'>
            <label htmlFor="demand">Pricing field:</label>
            <select id="pricing" value={pricing} onChange={(e) => setPricing(e.target.value)}>
              <option value="b_pricing">pricing</option>
              <option value="random_pricing">random pricing</option>
              <option value="population_pricing">population</option>
            </select>
          </div>
    
          <div className='billboard-settings-label'>
            <label htmlFor="billboards"># of billboards:</label>
            <input 
              id="billboards" 
              type="number" 
              min="1" 
              max="50" 
              value={numberOfBillboards} 
              onChange={(e) => setNumberOfBillboards(e.target.value)}
            />
          </div>
    
          <div className='billboard-settings-label'>
            <label htmlFor="radius">Radius:</label>
            <input 
              id="radius" 
              type="number" 
              min="1" 
              max="10000"
              step="500" 
              value={radius} 
              onChange={(e) => setRadius(e.target.value)}
            />
          </div>

          <div className='billboard-settings-label'>
            <label htmlFor="budget">Total Budget:($/mo)</label>
            <input 
              id="budgetm" 
              type="number" 
              min="1000" 
              max="1000000" 
            />
          </div>
    
          <div className='billboard-settings-label'>
            <button onClick={onSubmitClick}>Submit</button>
          </div>

        </div>
      );
    }

export default BillboardSettingsPanel;