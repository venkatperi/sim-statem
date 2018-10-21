function createSM( opts ) {
  return `
  ({genStatem, step, afterEvent, onState} ) => {
  const { StateMachine, nextState, keepState, repeatState } = genStatem;
  afterEvent = afterEvent || function() {} 
  onState = onState || function() {} 
  
  const sm = new StateMachine( {
    handlers: ${opts.handlers},
    initialState: '${opts.initialState}',
    initialData: ${opts.initialData},
  } )
  
  let p = Promise.resolve()
  function exec(fn, name){ 
    return (...args) => {
      p = p
          .then(() => fn(...args))
          .then(() => step ? sm.getStateAndData() : undefined)
          .then((status) => afterEvent(name, args, status))
          .catch(console.warn)
     }
  }
  exec(()=>{}, 'initial')()
  const call = exec(sm.call.bind( sm ), 'call')
  const cast = exec(sm.cast.bind( sm ), 'cast')
  sm.on( 'state', onState )
  sm.startSM()
  
  ${opts.events}
}
`
}

export default (( opts ) => {
  const res = []
  res.push( createSM( opts ) )

  return res.join( '\n' )
})


