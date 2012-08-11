:: %1 - Number of T3 servers
:: %2 - Number of Testers
:: %3 - Number of Requests per tester

@echo off

ECHO Starting T1 server.
	start node lib\T1\server.js

sleep 3

setlocal ENABLEDELAYEDEXPANSION

ECHO Starting %1 T3 servers.

FOR /L %%i IN (1,1,%1) DO (
	ECHO Starting server %%i
	start node lib\T3\server.js SQL
	
)


ECHO Sleeping 3 seconds and starting %2 Testers, %3 of request

sleep 10

FOR /L %%j IN (1,1,%2) DO (
	ECHO Starting tester %%j
	start node tests\t1-server-test.js %3
	
)


endlocal