var SYSEX_HEADER = "F0 42 40 00 01 1C 09";
var ENTER_NATIVE = SYSEX_HEADER + " 00 00 01 F7";
var LEAVE_NATIVE = SYSEX_HEADER + " 00 00 00 F7";

// status codes
var STATUS = {
	PITCH_WHEEL: 0xE0, // pitch wheel

	// some controls as mod wheel,
	// xy-pad and knobs/sliders/solos/mutes/recs in normal mode
	CONTROL: 0xB0,

	NOTE_ON: 0x90,
	NOTE_OFF: 0x80,

	// native mode only
	NATIVE: {
		CONTROL: 0xBF,
		PAD_NOTE_ON: 0x91,
		PAD_NOTE_OFF: 0x81,
		TOUCH_NOTE_ON: 0x92,
		TOUCH_NOTE_OFF: 0x82,
		TOUCH_SCALE: 0xB2,
	},

	MIDI1: {
		SLIDER1: 0xE0,
		SLIDER8: 0xE7,
	},
};

var CC =
{
	NATIVE: {
		// status: CONTROL
		CYCLE: 0x2E,
		REW: 0x2B,
		FF: 0x2C,
		STOP: 0x2A,
		PLAY: 0x29,
		REC: 0x2D,

		PREV_TRACK: 0x3A,
		NEXT_TRACK: 0x3B,
		MARKER_SET: 0x3C,
		PREV_MARKER: 0x3D,
		NEXT_MARKER: 0x3E,

		SOLO1: 0x20,
		SOLO8: 0x27,
		MUTE1: 0x30,
		MUTE8: 0x37,
		REC1: 0x40,
		REC8: 0x47,

		KNOB1: 0x10,
		KNOB8: 0x17,
		SLIDER1: 0x00,
		SLIDER8: 0x07,

		// statuses: PAD_NOTE_{ON/OFF}
		PAD1: 0x40,
		PAD16: 0x4F,

		// status: CONTROL
		X_AXIS: 0x09,
		Y_ASIX: 0x0A,
		PAD_TOUCH: 0x0B,

		// status: TOUCH_SCALE
		TOUCH_SCALE_AXIS: 0x02,

		// status: CONTROL
		SLIDER_ABSOLUTE: 0x69,
		SLIDER_RELATIVE: 0x6A,
		SLIDER_LEFT_TAP: 0x6B,
		SLIDER_CENTER_TAP: 0x6C,
		SLIDER_RIGHT_TAP: 0x6D,

		PEDAL_EXPRESSION: 0x0B,
		PEDAL_SWITCH: 0x40,

		// status: STATUS.CONTROL
		MOD_WHEEL: 0x01,
	},

	MIDI0: {
		// status: CONTROL

		// xy-control
		X_AXIS: 0x0C,
		Y_ASIX: 0x0D,
		PAD_TOUCH: 0x5C,

		// knobs & sliders in control mode
		KNOB1: 0x10,
		KNOB8: 0x17,
		SLIDER1: 0x18,
		SLIDER8: 0x1F,
		SOLO1: 0x20,
		SOLO8: 0x27,
		MUTE1: 0x30,
		MUTE8: 0x37,
		REC1: 0x53,
		REC8: 0x5A,
	},

	MIDI1: {
		// status: NOTE_ON

		// DAW controls
		PREV_TRACK: 0x2E,
		NEXT_TRACK: 0x2F,

		MARKER_SET: 0x52,
		PREV_MARKER: 0x54,
		NEXT_MARKER: 0x55,

		REW: 0x5B,
		FF: 0x5C,
		STOP: 0x5D,
		PLAY: 0x5E,
		REC: 0x5F,
		CYCLE: 0x56,

		// status: CONTROL
		// knobs in mixer mode
		KNOB1: 0x10,
		KNOB8: 0x17,

		// status: NOTE_ON
		SOLO1: 0x08,
		SOLO8: 0x0F,
		MUTE1: 0x10,
		MUTE8: 0x17,
		REC1: 0x00,
		REC8: 0x07,
	},
};
