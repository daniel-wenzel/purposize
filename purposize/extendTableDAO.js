module.exports = (tableDAO) => {
  const originalCreate = tableDAO.create 

  tableDAO.create = function() {
    const values = arguments['0']
    const options = arguments['1']

    if (typeof options === 'undefined' || typeof options.purpose === 'undefined') {
      return Promise.reject('ERROR: Please specify a purpose when creating a new instance!')
    }
    
    if (typeof options.purpose === 'string' || Array.isArray(options.purpose)) {
      // TODO: 
      // 1. Check if values are allowed to be stored for the specified purpose
      // 2. Store which fields are being stored for which purpose in metadata tables
      // Maybe more?
      return originalCreate.apply(this, arguments)
    } else {
      return Promise.reject('ERROR: Incorrect purpose format!')
    }  
  }
}