import React, { useState } from 'react';
import { BiShow } from "react-icons/bi";

function BillboardSettingsPanel({onCalBillboardLocations}) {
    
  const IntroContent = "BIQ is designed to identify the most prime billboard locations for your outdoor advertising campaigns. " + 
                        "Our decision-making process is based on: Estimation of Views, Billboard Influence Radius, " + 
                        "Budgetary Considerations, Volume of Locations.";

  const DEF_BUDGET = 20000;
  const DEF_RADIUS = 2000;
  const DEF_TOTALNUM_BB = 15;

  const [marketingIndustryType, setMarketingIndustryType] = useState("food");
  const [demandQuantifer, setDemandQuantifer] = useState("review_counts");
  const [numberOfBillboards, setNumberOfBillboards] = useState(DEF_TOTALNUM_BB);
  const [radius, setRadius] = useState(DEF_RADIUS);
  const [radiusByTypes, setRadiusByTypes] = useState([0,0,0,0]);
  const [budget, setBudget] = useState(DEF_BUDGET);
  const [solver, setSolver] = useState("gurobi");
  const [isUniversalBBRadius, setIsUniversalBBRadius] = useState(true);
  const [isShowAdvanceOptions, setIsShowAdvanceOptions] = useState(false);

  const getBBTypeToggleBtnText = () => {
    if (isUniversalBBRadius) {
      return "Set Radius by Billboard Types";
    } else {
      return "Set Universal Infulence Radius";
    }
  };

  const switchSetBBRadiusType = () => {
    setIsUniversalBBRadius(prevState => !prevState);
  };

  const switchAdvOptsDisplay = () => {
    setIsShowAdvanceOptions(prevState => !prevState);
  };

  const onCalculateBtnClick = () => {
    const params = {
      industry: marketingIndustryType,
      demandQunt: demandQuantifer,
      nBillboards: numberOfBillboards,
      influentR: radius,
      moBudget: budget,
      solver: solver
    };
    onCalBillboardLocations(params);
  };

  return (
    <div className='biq-bb-tab-container'>
      <div className='biq-bb-title-div'>Optimized Billboard Location Finder</div>
      <div className='biq-bb-content-div'>{IntroContent}</div>
      {/** Industries */}
      <div className='biq-bb-input-div'>
        <div className='biq-bb-input-title'>{"Marketing Industries"}</div>
        <select value={marketingIndustryType} onChange={(e) => setMarketingIndustryType(e.target.value)}>
          <option value="food">Food</option>
          <option value="auto">Auto Services</option>
          <option value="home">Home Services</option>
        </select>
      </div>
      {/** Demand quantifier */}
      <div className='biq-bb-input-div'>
        <div className='biq-bb-input-title'>{"Infulence Quantifer"}</div>
        <select value={demandQuantifer} onChange={(e) => setDemandQuantifer(e.target.value)}>
          <option value="review_counts">Review Counts</option>
          <option value="count_ratings">Counts + Ratings</option>
        </select>
      </div>
      {/** Monthly Budget */}
      <div className='biq-bb-input-div'>
        <div className='biq-bb-input-title'>{"Monthly Budget ($/mo)"}</div>
        <input type="number" min="1000" max="1000000" value={budget} onChange={(e) => setBudget(e.target.value)} />
      </div>
      {/** Max number of billboards */}
      <div className='biq-bb-input-div'>
        <div className='biq-bb-input-title'>{"Max # of Billboards"}</div>
        <input type="number" min="1" max="50" value={numberOfBillboards} onChange={(e) => setNumberOfBillboards(e.target.value)} />
      </div>

      {/** Set billboard infulence by type */}
      <div className='biq-bb-input-div'>
        <div className='biq-bb-input-title'></div>
        <button className='biq-link-btn' onClick={(e) => switchSetBBRadiusType()}>{getBBTypeToggleBtnText()}</button>
      </div>
      {/** Set billboard infulence radius - universal */}
      { isUniversalBBRadius && 
      <div className='biq-bb-input-div'>
        <div className='biq-bb-input-title'>{"Billboard Infulence Radius (meters)"}</div>
        <input type="number" min="500" max="10000" value={radius} onChange={(e) => setRadius(e.target.value)} />
      </div> }

      { !isUniversalBBRadius && 
      <>
        <div className='biq-bb-input-div'>
          <div className='biq-bb-input-title'>{"Digital Billboards"}</div>
          <input type="number" min="500" max="10000" value={3000}/>
        </div>
        <div className='biq-bb-input-div'>
          <div className='biq-bb-input-title'>{"Bulletin Billboards"}</div>
          <input type="number" min="500" max="10000" value={2500}/>
        </div>
        <div className='biq-bb-input-div'>
          <div className='biq-bb-input-title'>{"Bus Shelter Ads"}</div>
          <input type="number" min="500" max="10000" value={1500}/>
        </div>
        <div className='biq-bb-input-div'>
          <div className='biq-bb-input-title'>{"Street Bench Ads"}</div>
          <input type="number" min="500" max="10000" value={1000}/>
        </div>
        <div className='biq-bb-input-div biq-content-align-end'>
          {"(all distance are in meters)"}
        </div>
      </> }

      {/** Advance Options */}
      
      <div className='biq-bb-input-div'>
        <div className='biq-bb-input-title'></div>
        <button className='biq-link-btn' onClick={(e) => switchAdvOptsDisplay()}>{isShowAdvanceOptions ? "Hide Advanced Options" : "Show Advanced Options"}</button>
      </div>
      { isShowAdvanceOptions && 
      <>
        <div className='biq-bb-input-div'>
          <div className='biq-bb-input-title'>{"MIP Solver Options"}</div>
          <select className='biq-bb-select' value={solver} onChange={(e) => setSolver(e.target.value)}>
            <option value="solver.sp_gurobi">{"Gurobi"}</option>
            <option value="solver.sp_cplex">{"IBM Cplex"}</option>
            <option value="solver.sp_ortools">{"Google Ortools (free)"}</option>
            <option value="heuristic.sp_ga">{"Heuristic - Genetic Algorithm (free)"}</option>
            <option value="heuristic.sp_greedy">{"Heuristic - Greedy Algorithm (free)"}</option>
            <option value="heuristic.sp_sa">{"Heuristic - Simulated Annealing (free)"}</option>
          </select>
        </div>
      </> }

      {/** Operation buttons */}
      <div className='biq-bb-bottom-div'>
        <button className='biq-bb-btn biq-bb-reset-btn'>Reset</button>
        <button className='biq-bb-btn biq-bb-calc-btn' onClick={(e) => onCalculateBtnClick()}>Calculate</button>
      </div>
      <button className='biq-link-btn'>Show/Hide Current Results</button>
    
    
    </div>
  );
}

export default BillboardSettingsPanel;


/**
 * <div>
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
              value={DEF_TOTALNUM_BB} 
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
              value={DEF_RADIUS} 
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
              value={DEF_BUDGET}
              onChange={(e) => setBudget(e.target.value)} 
            />
          </div>
    
          <div className='billboard-settings-label'>
            <button onClick={onSubmitClick}>Submit</button>
          </div>

        </div>
 */