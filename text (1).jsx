'use strict';

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

var checkboxSelection = function (params) {
  // we put checkbox on the name if we are not doing grouping
  return params.columnApi.getRowGroupColumns().length === 0;
};

var headerCheckboxSelection = function (params) {
  // we put checkbox on the name if we are not doing grouping
  return params.columnApi.getRowGroupColumns().length === 0;
};

const AgentList = () => {
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const [token, setToken] = useState();
  const [agentListData, setAgentListData] = useState();    

  const [columnDefs, setColumnDefs] = useState([
    {
      field: 'ID',
      minWidth: 170,
      checkboxSelection: checkboxSelection,
      headerCheckboxSelection: headerCheckboxSelection,
    },
    { field: 'Name' },
    { field: 'IP' },
    { field: 'Groups' },
    { field: 'OS' },
    { field: 'Cluster Node' },
    { field: 'Version' },
    { field: 'Registration Date' },
    { field: 'Last keep alive' },
    { field: 'Status' },
    { field: 'Action' },

  ]);
  const autoGroupColumnDef = useMemo(() => {
    return {
      headerName: 'Group',
      minWidth: 170,
      field: 'athlete',
      valueGetter: (params) => {
        if (params.node.group) {
          return params.node.key;
        } else {
          return params.data[params.colDef.field];
        }
      },
      headerCheckboxSelection: true,
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: {
        checkbox: true,
      },
    };
  }, []);
  const defaultColDef = useMemo(() => {
    return {
      editable: true,
      enableRowGroup: true,
      enablePivot: true,
      enableValue: true,
      sortable: true,
      resizable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
    };
  }, []);

  const onGridReady = useCallback((params) => {

    console.log("onb grid ready");
    console.log("---------------------")
      console.log(token)

      if(token) {
      const agentDatalist = [];
      //listAgentCount();
      fetch('https://172.17.16.45:55000/api/request', {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          headers: {
              'Content-Type': 'application/json',
              'osd-xsrf': 'kibana',
              'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify( {
              "method":"GET",
              "path":"/agents",
              "body":{ 
                  "params": {
                  limit: 15, offset: 0, q: "id!=000", sort: "+id"
                  }
              },
              "id":"default"}),
      }).then(listresponse => listresponse.json())
      .then(agents=> setAgentListData(agents.data)); 

      if(agentListData && agentListData.affected_items)    {
        agentListData.affected_items.map(function(item){
            console.log(item, "Items are here:-----------");
            let agent = [];    
            agent.push(item.id);
            agent.push(item.name);
            agent.push(item.ip );
            agent.push("-");
            agent.push( item.os && item.os.name ? item.os.name :"-");
            agent.push(item.node_name);
            agent.push(item.version ? item.version : "-");
            agent.push(item.dateAdd);
            agent.push(item.lastKeepAlive ? item.lastKeepAlive : "-");
            agent.push(item.status);
            agent.push("-");
            
            agentDatalist.push(agent);
        });    
      }
    }

    }, [token]);



  useEffect(()=>{
    let myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic "+btoa("wazuh:wazuh"));
    let requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch('http://172.17.16.45:55000/security/user/authenticate', requestOptions)
      .then((resp) => resp.json())
      .then((response) => {
        console.log("this is here");
        console.log("response.data.token here___", response.data.token);
        setToken(response.data.token);
      });
    
  }, []);














  return (
    <div style={containerStyle}>
      <div style={gridStyle} className="ag-theme-alpine">
        <AgGridReact
          
          columnDefs={columnDefs}
          autoGroupColumnDef={autoGroupColumnDef}
          defaultColDef={defaultColDef}
          suppressRowClickSelection={true}
          groupSelectsChildren={true}
          rowSelection={'multiple'}
          rowGroupPanelShow={'always'}
          pivotPanelShow={'always'}
          pagination={true}
          onGridReady={onGridReady}

          rowData={agentListData}
        ></AgGridReact>
      </div>
    </div>
  );
};

export default AgentList;
















api for agent list: {{baseUrl}}/agents?pretty=true&wait_for_complete=true

