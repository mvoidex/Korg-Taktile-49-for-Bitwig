function displayMessage(msg)
{
	sysexMessage = "F0 42 40 00 01 1C 09 22 18 ";
	for (var p = 0; p < 24; ++p) {
		sysexMessage += asciiCharToHex(p < msg.length ? msg[p] : ' ');
	}
	sysexMessage += " F7";

	sendSysex(sysexMessage);
}

function displayPopupMessage(msg)
{
	sysexMessage = "F0 42 40 00 01 1C 09 2C 18 ";
	for (var p = 0; p < 24; ++p) {
		sysexMessage += asciiCharToHex(p < msg.length ? msg[p] : ' ');
	}
	sysexMessage += " F7";

	sendSysex(sysexMessage);
}
