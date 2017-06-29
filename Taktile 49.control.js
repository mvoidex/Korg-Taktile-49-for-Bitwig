loadAPI(3);

load("taktile-vars.js");
load("taktile-led.js");

// Remove this if you want to be able to use deprecated methods without causing script to stop.
// This is useful during development.
host.setShouldFailOnDeprecatedUse(true);

host.defineController("Korg", "Taktile 49", "0.1", "428cfd4c-f65d-4867-a165-04a44d607145", "voidex");
host.defineMidiPorts(3, 3);
host.addDeviceNameBasedDiscoveryPair(
	["taktile-49 1 KEYBOARD/CTRL", "taktile-49 1 DAW IN", "taktile-49 1 MIDI I/F IN"],
	["taktile-49 1 CTRL", "taktile-49 1 DAW OUT", "taktile-49 1 MIDI I/F OUT"]
);

var nativeMode = false;
var mixerMode = false; // only in native mode
var setPressed = false;

function enterNativeMode() { sendSysex(ENTER_NATIVE); nativeMode = true; }
function leaveNativeMode() { sendSysex(LEAVE_NATIVE); nativeMode = false; }
function switchNativeMode() { nativeMode ? leaveNativeMode() : enterNativeMode(); }

function init() {
	transport = host.createTransport();
	application = host.createApplication();
	trackBank = host.createTrackBank(8, 1, 0);
	cursorTrack = host.createCursorTrack(2, 0);
	primaryDecive = cursorTrack.createCursorDevice("Primary", "Primary", 8, CursorDeviceFollowMode.FOLLOW_SELECTION);
	remoteControlsPage = primaryDecive.createCursorRemoteControlsPage(8);
	arranger = host.createArranger(0);

	transport.isPlaying().addValueObserver(function(on) {
		setLED(CC.NATIVE.PLAY, on);
		setLED(CC.NATIVE.STOP, !on);
	});

	transport.isArrangerLoopEnabled().addValueObserver(function(on) {
		setLED(CC.NATIVE.CYCLE, on);
	});

	transport.isArrangerRecordEnabled().addValueObserver(function(on) {
		setLED(CC.NATIVE.REC, on);
	});

	host.getMidiInPort(0).setMidiCallback(function (status, cc, val) { onMidi(0, status, cc, val); });
	host.getMidiInPort(0).setSysexCallback(onSysex0);
	host.getMidiInPort(1).setMidiCallback(function (status, cc, val) { onMidi(1, status, cc, val); });
	host.getMidiInPort(1).setSysexCallback(onSysex1);

	generic = host.getMidiInPort(0).createNoteInput("", "??????");
	generic.setShouldConsumeEvents(false);

	for (var p = 0; p < 8; ++p) {
		remoteControlsPage.getParameter(p).setIndication(true);
		track = trackBank.getChannel(p);
		track.getVolume().setIndication(true);
		track.getPan().setIndication(true);
	}

	enterNativeMode();
	host.showPopupNotification("Taktile 49 initialized!");
}

// Called when a short MIDI message is received on MIDI input port 0.
function onMidi(midi, status, data1, data2)
{
	var cc = data1;
	var val = data2;

	// host.showPopupNotification("MIDI " + midi + ": " + status + " " + cc + " " + val);
	index = cc & 7;

	// marker set
	if (
		(midi == 0 && nativeMode && status == STATUS.NATIVE.CONTROL && cc == CC.NATIVE.MARKER_SET) ||
		(midi == 1 && !nativeMode && status == STATUS.NOTE_ON && cc == CC.MIDI1.MARKER_SET)
	) {
		setPressed = val > 0;
		return;
	}

	if (
		(midi == 0 && nativeMode && status == STATUS.NATIVE.CONTROL && cc == CC.NATIVE.REW) ||
		(midi == 1 && status == STATUS.NOTE_ON && cc == CC.MIDI1.REW)
	) {
		if (val > 0) { transport.rewind(); }
		return;
	}

	if (
		(midi == 0 && nativeMode && status == STATUS.NATIVE.CONTROL && cc == CC.NATIVE.FF) ||
		(midi == 1 && status == STATUS.NOTE_ON && cc == CC.MIDI1.FF)
	) {
		if (val > 0) {
			if (setPressed) { arranger.isPlaybackFollowEnabled().toggle(); }
			else { transport.fastForward(); }
		}
		return;
	}

	if (
		(midi == 0 && nativeMode && status == STATUS.NATIVE.CONTROL && cc == CC.NATIVE.STOP) ||
		(midi == 1 && status == STATUS.NOTE_ON && cc == CC.MIDI1.STOP)
	) {
		if (val > 0) {
			if (setPressed) { transport.resetAutomationOverrides(); }
			else { transport.stop(); }
		}
		return;
	}

	if (
		(midi == 0 && nativeMode && status == STATUS.NATIVE.CONTROL && cc == CC.NATIVE.PLAY) ||
		(midi == 1 && status == STATUS.NOTE_ON && cc == CC.MIDI1.PLAY)
	) {
		if (val > 0) {
			if (setPressed) { transport.returnToArrangement() }
			else if (transport.isPlaying()) { transport.restart(); }
			else { transport.play(); }
		}
		return;
	}

	if (
		(midi == 0 && nativeMode && status == STATUS.NATIVE.CONTROL && cc == CC.NATIVE.REC) ||
		(midi == 1 && status == STATUS.NOTE_ON && cc == CC.MIDI1.REC)
	) {
		if (val > 0) {
			if (setPressed) { cursorTrack.getArm().toggle(); }
			else { transport.record(); }
		}
		return;
	}

	if (
		(midi == 0 && nativeMode && status == STATUS.NATIVE.CONTROL && cc == CC.NATIVE.PREV_TRACK) ||
		(midi == 1 && status == STATUS.NOTE_ON && cc == CC.MIDI1.PREV_TRACK)
	) {
		if (val > 0) {
			if (setPressed) { trackBank.scrollChannelsPageUp(); }
			else { cursorTrack.selectPrevious(); }
		}
		return;
	}

	if (
		(midi == 0 && nativeMode && status == STATUS.NATIVE.CONTROL && cc == CC.NATIVE.NEXT_TRACK) ||
		(midi == 1 && status == STATUS.NOTE_ON && cc == CC.MIDI1.NEXT_TRACK)
	) {
		if (val > 0) {
			if (setPressed) { trackBank.scrollChannelsPageDown(); }
			else { cursorTrack.selectNext(); }
		}
		return;
	}

	if (
		(midi == 0 && nativeMode && status == STATUS.NATIVE.CONTROL && cc == CC.NATIVE.PREV_MARKER) ||
		(midi == 1 && status == STATUS.NOTE_ON && cc == CC.MIDI1.PREV_MARKER)
	) {
		if (val > 0) { remoteControlsPage.selectPreviousPage(false); }
		return;
	}

	if (
		(midi == 0 && nativeMode && status == STATUS.NATIVE.CONTROL && cc == CC.NATIVE.NEXT_MARKER) ||
		(midi == 1 && status == STATUS.NOTE_ON && cc == CC.MIDI1.NEXT_MARKER)
	) {
		if (val > 0) { remoteControlsPage.selectNextPage(false); }
		return;
	}

	// TODO: pads
	// TODO: xy control
	// TODO: mod wheel
	// TODO: pitch wheel

	// knobs
	if (
		(midi == 0 && nativeMode && !mixerMode && status == STATUS.NATIVE.CONTROL && withinRange(cc, CC.NATIVE.KNOB1, CC.NATIVE.KNOB8)) ||
		(midi == 0 && !nativeMode && status == STATUS.CONTROL && withinRange(cc, CC.MIDI0.KNOB1, CC.MIDI0.KNOB8))
	) {
		parameter = remoteControlsPage.getParameter(index);
		if (setPressed) { parameter.reset(); }
		else { parameter.set(val, 128); }
		return;
	}

	// mixer knobs - pan
	if (
		(midi == 0 && nativeMode && mixerMode && status == STATUS.NATIVE.CONTROL && withinRange(cc, CC.NATIVE.KNOB1, CC.NATIVE.KNOB8)) ||
		(midi == 1 && !nativeMode && status == STATUS.CONTROL && withinRange(cc, CC.MIDI1.KNOB1, CC.MIDI1.KNOB8))
	) {
		track = trackBank.getChannel(index);
		if (setPressed) { track.getPan().reset(); }
		else {
			if (nativeMode) {
				// absolute value
				track.getPan().set(val, 128);
			}
			else {
				// relatives
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
		return;
	}

	// mixer sliders - volume
	if (
		(midi == 0 && nativeMode && mixerMode && status == STATUS.NATIVE.CONTROL && withinRange(cc, CC.NATIVE.SLIDER1, CC.NATIVE.SLIDER8)) ||
		(midi == 1 && !nativeMode && withinRange(status, STATUS.MIDI1.SLIDER1, STATUS.MIDI1.SLIDER8))
	) {
		index = status & 7;
		track = trackBank.getChannel(index);
		if (setPressed) { track.getVolume().reset(); }
		else { track.getVolume().set(val, 128); }
		return;
	}

	if (
		(midi == 0 && nativeMode && !mixerMode && status == STATUS.NATIVE.CONTROL && withinRange(cc, CC.NATIVE.SOLO1, CC.NATIVE.SOLO8)) ||
		(midi == 0 && !nativeMode && status == STATUS.CONTROL && withinRange(cc, CC.MIDI0.SOLO1, CC.MIDI0.SOLO8))
	) {
		remoteControlsPage.selectedPageIndex().set(index);
		names = remoteControlsPage.pageNames().get();
		if (index < names.length) {
			host.showPopupNotification("Page: " + names[index]);
		}
		return;
	}

	if (
		(midi == 0 && nativeMode && mixerMode && status == STATUS.NATIVE.CONTROL && withinRange(cc, CC.NATIVE.SOLO1, CC.NATIVE.SOLO8)) ||
		(midi == 1 && !nativeMode && status == STATUS.CONTROL && withinRange(cc, CC.MIDI1.SOLO1, CC.MIDI1.SOLO8))
	) {
		if (val > 0) { trackBank.getChannel(index).getSolo().toggle(); }
		return;
	}

	if (
		(midi == 0 && nativeMode && mixerMode && status == STATUS.NATIVE.CONTROL && withinRange(cc, CC.NATIVE.MUTE1, CC.NATIVE.MUTE8)) ||
		(midi == 1 && !nativeMode && status == STATUS.CONTROL && withinRange(cc, CC.MIDI1.MUTE1, CC.MIDI1.MUTE8))
	) {
		if (val > 0) { trackBank.getChannel(index).getMute().toggle(); }
		return;
	}

	if (
		(midi == 0 && nativeMode && mixerMode && status == STATUS.NATIVE.CONTROL && withinRange(cc, CC.NATIVE.REC1, CC.NATIVE.REC8)) ||
		(midi == 1 && !nativeMode && status == STATUS.CONTROL && withinRange(cc, CC.MIDI1.REC1, CC.MIDI1.REC8))
	) {
		if (val > 0) { trackBank.getChannel(index).getArm().toggle(); }
		return;
	}
}

// Called when a MIDI sysex message is received on MIDI input port 0.
function onSysex0(data)
{
	// host.showPopupNotification("SYSEX 0: " + data);
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

// Called when a MIDI sysex message is received on MIDI input port 1.
function onSysex1(data)
{
	// host.showPopupNotification("SYSEX 1: " + data);
}

function flush()
{
	if (nativeMode) {
		flushLEDs();
	}
}

function exit()
{
	if (nativeMode) {
		leaveNativeMode();
	}
}
