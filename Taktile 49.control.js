loadAPI(3);

// Remove this if you want to be able to use deprecated methods without causing script to stop.
// This is useful during development.
host.setShouldFailOnDeprecatedUse(true);

host.defineController("Korg", "Taktile 49", "0.1", "428cfd4c-f65d-4867-a165-04a44d607145", "voidex");
host.defineMidiPorts(3, 3);
host.addDeviceNameBasedDiscoveryPair(
	["taktile-49 1 KEYBOARD/CTRL", "taktile-49 1 DAW IN", "taktile-49 1 MIDI I/F IN"],
	["taktile-49 1 CTRL", "taktile-49 1 DAW OUT", "taktile-49 1 MIDI I/F OUT"]
);

var SYSEX_HEADER = "F0 42 40 00 01 1C 09";
var ENTER_NATIVE = SYSEX_HEADER + " 00 00 01 F7";
var LEAVE_NATIVE = SYSEX_HEADER + " 00 00 00 F7";

var STATUS =
{
	TUNE: 224,
	CONTROL: 176,
	NOTE_ON: 144,
	NOTE_OFF: 128,

	// mixer sliders, MIDI 1
	MIXER1: 224,
	MIXER8: 231,
}

var LED =
{
	CYCLE: 46,
	REW: 43,
	FF: 44,
	STOP: 42,
	PLAY: 41,
	REC: 45,

	SOLO1: 32,
	SOLO8: 39,
	MUTE1: 48,
	MUTE8: 55,
	REC1: 64,
	REC8: 71,
}

var CC =
{
	MIDI0: {
		MOD_WHEEL: 1,

		// XY control
		TRACK_X: 12,
		TRACK_Y: 13,

		// knobs & sliders in control mode
		KNOB1: 16,
		KNOB8: 23,
		SLIDER1: 24,
		SLIDER8: 31,
		SOLO1: 32,
		SOLO8: 39,
		MUTE1: 48,
		MUTE8: 55,
		REC1: 83,
		REC8: 90,
	},

	MIDI1: {
		// DAW controls
		PREV_TRACK: 46,
		NEXT_TRACK: 47,

		SET: 82,
		PREV_MARKER: 84,
		NEXT_MARKER: 85,

		REW: 91,
		FF: 92,
		STOP: 93,
		PLAY: 94,
		REC: 95,
		CYCLE: 86,

		// knobs in mixer mode
		KNOB1: 16,
		KNOB8: 23,
		SOLO1: 8,
		SOLO8: 15,
		MUTE1: 16,
		MUTE8: 23,
		REC1: 0,
		REC8: 7,
	}
}

var ledState = initArray(0, 128);
var pendingLedState = initArray(0, 128);

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

function init() {
	transport = host.createTransport();
	application = host.createApplication();
	trackBank = host.createTrackBank(8, 1, 0);
	cursorTrack = host.createCursorTrack(2, 0);
	primaryDecive = cursorTrack.createCursorDevice("Primary", "Primary", 8, CursorDeviceFollowMode.FOLLOW_SELECTION);
	remoteControlsPage = primaryDecive.createCursorRemoteControlsPage(8);
	arranger = host.createArranger(0);

	setPressed = false;
	// ledState = {};
	// pendingLedState = {};

	transport.isPlaying().addValueObserver(function(on) {
		println('PLAYING: ' + on);
		setLED(LED.PLAY, on);
		setLED(LED.STOP, !on);
	});

	// transport.isArrangerLoopEnabled().addValueObserver(function(on) {
	// 	ledState[LED.CYCLE] = on;
	// });

	// transport.isArrangerRecordEnabled(function(on) {
	// 	ledState[LED.REC] = on;
	// });

	host.getMidiInPort(0).setMidiCallback(onMidi0);
	host.getMidiInPort(0).setSysexCallback(onSysex0);
	host.getMidiInPort(1).setMidiCallback(onMidi1);
	host.getMidiInPort(1).setSysexCallback(onSysex1);

	generic = host.getMidiInPort(0).createNoteInput("", "??????");
	generic.setShouldConsumeEvents(false);

	for (var p = 0; p < 8; ++p) {
		remoteControlsPage.getParameter(p).setIndication(true);
		track = trackBank.getChannel(p);
		track.getVolume().setIndication(true);
		track.getPan().setIndication(true);
	}

	host.showPopupNotification("Taktile 49 initialized!");
}

// Called when a short MIDI message is received on MIDI input port 0.
function onMidi0(status, data1, data2)
{
	// TODO: Implement your MIDI input handling code here.
	var cc = data1;
	var val = data2;

	host.showPopupNotification("MIDI 0: " + status + " " + cc + " " + val);

	index = cc & 7;
	if (withinRange(cc, CC.MIDI0.KNOB1, CC.MIDI0.KNOB8)) {
		parameter = remoteControlsPage.getParameter(index);
		if (setPressed) { parameter.reset(); }
		else { parameter.set(val, 128); }
	}
	else if (withinRange(cc, CC.MIDI0.SLIDER1, CC.MIDI0.SLIDER8)) {
		// nothing special to do
	}
	else if (withinRange(cc, CC.MIDI0.SOLO1, CC.MIDI0.SOLO8)) {
		remoteControlsPage.selectedPageIndex().set(index);
		names = remoteControlsPage.pageNames().get();
		if (index < names.length) {
			host.showPopupNotification("Page: " + names[index]);
		}
	}
	else if (withinRange(cc, CC.MIDI0.MUTE1, CC.MIDI0.MUTE8)) {
		// nothing special
	}
	else if (withinRange(cc, CC.MIDI0.REC1, CC.MIDI0.REC8)) {
		// nothing special
	}
}

// Called when a MIDI sysex message is received on MIDI input port 0.
function onSysex0(data)
{
	host.showPopupNotification("SYSEX 0: " + data);
	// MMC Transport Controls:
	switch (data) {
		case "f07f7f0605f7":
			transport.rewind();
			break;
		case "f07f7f0604f7":
			transport.fastForward();
			break;
		case "f07f7f0601f7":
			transport.stop();
			break;
		case "f07f7f0602f7":
			transport.play();
			break;
		case "f07f7f0606f7":
			transport.record();
			break;
	}
}
// Called when a short MIDI message is received on MIDI input port 1.
function onMidi1(status, data1, data2)
{
	var cc = data1;
	var val = data2;

	host.showPopupNotification("MIDI 1: " + status + " " + cc + " " + val);

	if (withinRange(status, STATUS.MIXER1, STATUS.MIXER8)) {
		index = status & 7;
		track = trackBank.getChannel(index);
		if (setPressed) { track.getVolume().reset(); }
		else { track.getVolume().set(val, 128); }
		return;
	}

	index = cc & 7;

	if (cc == CC.MIDI1.SET) {
		setPressed = val > 0;
	}

	if (val > 0) {
		switch (cc) {
			case CC.MIDI1.PREV_TRACK:
				if (setPressed) { trackBank.scrollChannelsPageUp(); }
				else { cursorTrack.selectPrevious(); }
				break;

			case CC.MIDI1.NEXT_TRACK:
				if (setPressed) { trackBank.scrollChannelsPageDown(); }
				else { cursorTrack.selectNext(); }
				break;

			case CC.MIDI1.PREV_MARKER:
				if (val > 0) { remoteControlsPage.selectPreviousPage(false); }
				break;

			case CC.MIDI1.NEXT_MARKER:
				if (val > 0) { remoteControlsPage.selectNextPage(false); }
				break;

			case CC.MIDI1.REW:
				transport.rewind();
				break;

			case CC.MIDI1.FF:
				if (setPressed) { arranger.isPlaybackFollowEnabled().toggle(); }
				else { transport.fastForward(); }
				break;

			case CC.MIDI1.STOP:
				if (setPressed) { transport.resetAutomationOverrides(); }
				else { transport.stop(); }
				break;

			case CC.MIDI1.PLAY:
				if (setPressed) { transport.returnToArrangement() }
				else if (transport.isPlaying()) { transport.restart(); }
				else { transport.play(); }
				break;

			case CC.MIDI1.REC:
				if (setPressed) { cursorTrack.getArm().toggle(); }
				else { transport.record(); }
				break;

			case CC.MIDI1.CYCLE:
				transport.isArrangerLoopEnabled().toggle();
				break;
		}
	}

	if (status == STATUS.CONTROl && withinRange(cc, CC.MIDI1.KNOB1, CC.MIDI1.KNOB8)) {
		track = trackBank.getChannel(index);
		if (setPressed) { track.getPan().reset(); }
		else {
			switch (val) {
				case 1: // turning right
					track.getPan().inc(1, 128);
					break;
				case 63: // max right value
					track.getPan().set(127, 128);
					break;
				case 65: // turning left
					track.getPan().inc(-1, 128);
					break;
				case 127: // max left value
					track.getPan().set(0, 128);
					break;
			}
		}
	}
	else if (withinRange(cc, CC.MIDI1.SOLO1, CC.MIDI1.SOLO8)) {
		if (val > 0) { trackBank.getChannel(index).getSolo().toggle(); }
	}
	else if (withinRange(cc, CC.MIDI1.MUTE1, CC.MIDI1.MUTE8)) {
		if (val > 0) { trackBank.getChannel(index).getMute().toggle(); }
	}
	else if (withinRange(cc, CC.MIDI1.REC1, CC.MIDI1.REC8)) {
		if (val > 0) { trackBank.getChannel(index).getArm().toggle(); }
	}
}

// Called when a MIDI sysex message is received on MIDI input port 1.
function onSysex1(data)
{
	host.showPopupNotification("SYSEX 1: " + data);
}

function flush()
{
	// sendSysex(ENTER_NATIVE);
	for (l in LED) {
		// updateLED(LED[l]);
	}
	// sendSysex(LEAVE_NATIVE);
}

function exit()
{
}
