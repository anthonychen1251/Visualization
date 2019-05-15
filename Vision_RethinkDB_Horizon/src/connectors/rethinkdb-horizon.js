import Horizon from '@horizon/client';
import horizonConfig from './horizon-config.json'

const DEFAULT_DATA = {
    values: [],
    type: 'number',
}

const defaultRethinkdbState = {
  data:[]
}

function rethinkdbReducer(state = defaultRethinkdbState, action){
  if (action.type === 'UPDATE') {
    console.log("state updated", action.data)
    return{
      data : action.data
    }
  }

  return state
}
function getRethinkdbData(serial_data, store) {
    serial_data.fetch().subscribe(
      (items) => {
        const ret = {}
        items.forEach((item) => {
          // Each result from the serial_data collection
          //  will pass through this function
          const { name, ...values } = item;
          ret[name] = { ...DEFAULT_DATA, ...values }
        })
        console.log("retrieve data from rethinkdb")
        console.log(ret)
        store.dispatch({type: 'UPDATE', data: ret})
      },
      // If an error occurs, this function
      //  will execute with the `err` message
      (err) => {
        console.log(err);
      })
}
export function connectorReducer(state, action) {
  return rethinkdbReducer(state, action)
}

export function connectorEnhancer(config = {}) {
    const host = horizonConfig['horizon']['host']
    const port = horizonConfig['horizon']['port']
    const table = horizonConfig['horizon']['table']
    return createStore => (...args) => {
      const store = createStore(...args)
      // Initialize Horizon instance
      const horizon = Horizon({host: host + ":" + port});
      // Initialize firetony table
      const serial_data = horizon(table);
  
      getRethinkdbData(serial_data, store);
  
      console.log('Listening for changes...')
      serial_data.watch().subscribe((docs) => { console.log('Change detected',docs),  getRethinkdbData(serial_data, store)})  

      return store
    }
  }