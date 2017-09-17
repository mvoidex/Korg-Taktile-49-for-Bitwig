var ledState = initArray(0, 128);
var pendingLedState = initArray(0, 128);

function isPadLED(cc)
{
	return withinRange(cc, 0x40, 0x4F);
}

function clearLEDs()
{
	for (var cc = 0; cc < ledState.length; ++cc) {
		ledState[cc] = 0;
		pendingLedState[cc] = 0;
	}
}

function setLED(cc, on)
{
	pendingLedState[cc] = on;
}

function updateLED(cc)
{
	if (ledState[cc] != pendingLedState[cc]) {
		if (isPadLED(cc)) {
			sendMidi(0x91, cc, pendingLedState[cc]);
		}
		else {
			sendChannelController(0xF, cc, pendingLedState[cc]);
		}
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

function mkRed()
{
	return 0x7F;
}

function mkGreen()
{
	return 0x01;
}
