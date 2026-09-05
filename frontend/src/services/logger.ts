import log from 'loglevel'

log.setLevel(import.meta.env.DEV ? 'debug' : 'warn')

export default log
