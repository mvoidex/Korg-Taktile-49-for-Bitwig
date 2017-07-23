var ledState = initArray(0, 128);
var pendingLedState = initArray(0, 128);

function clearLEDs(cc)
{
	for (var cc = 0; cc < ledState.length; ++cc) {
		ledState[cc] = 0;
		pendingLedState[cc] = 0;
	}
}

function setLED(cc, on)
{
	pendingLedState[cc] = on ? 127 : 0;
}

function updateLED(cc)
{
	if (ledState[cc] != pendingLedState[cc]) {
		sendChannelController(0xF, cc, pendingLedState[cc]);
		ledState[cc] = pendingLedState[cc];
	}
}

function getLED(cc)
{
	return ledState[cc];
}

function getPendingLED(cc)
{
	return pendingLedState[cc];
}

function flushLEDs()
{
	for (var cc = 0; cc < ledState.length; ++cc) {
		updateLED(cc);
	}
}
