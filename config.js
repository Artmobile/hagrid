var Config = {
	T2_ADDRESS: 'localhost',
	T2_EXCHANGE_NAME: 'command_exchange',
	T1_PORT : process.env.PORT || 3000,
	RESPONSE_TIMEOUT: 25000,
	WORKERS:{
		SQL: {
			PREFETCH_COUNT:1,
			SRC:'mysql-worker.js'
		},
		WS: {
			PREFETCH_COUNT:1000
		},
		GENERIC: {
			PREFETCH_COUNT:1
		}
	}
};

// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = Config;
}
