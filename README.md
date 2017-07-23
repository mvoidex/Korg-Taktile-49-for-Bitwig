Korg Taktile-49 for Bitwig Studio
===

Korg Taktile-49 in Bitwig Studio.

Notes
---

Taktile-49 can work in two different modes. By default (let's call it Default Mode), some of its buttons (for example, DAW functions or knobs/sliders when [CONTROL MODE] is off) are at midi 1 channel, others - at midi 0.
In this case taktile-49 works like generic controller (midi 0) and mcu pro (midi 1).
It is easy to configure, but there're some disadvantages:

 - I don't know how to turn on/off leds in this mode
 - You can't distinguish beetwen pad events and note events as long as pad sends notes

But there's also documented Native Mode.
In Native Mode [CONTROL MODE], [CHORD SCALE], [NOTE/CONTROL] and some other buttons becomes useless, but leds works and you get 8 pad pages compatible with Bitwig Drum Machine.

By default, plugin sets taktile-49 into Native Mode, but you can switch back by pressing [SET] + [CYCLE].

In Native Mode [CONTROL MODE] button is emulated. To toggle between Control Mode and Mixer Mode press [SET] + [PREV TRACK] + [NEXT TRACK]. There is also 'control' or 'mixer' message on display depending on what mode is now on.

Common actions
---

Buttons | Actions
-- | --
[REW] | rewind
[FF] | fast-forward
[STOP] | stop
[SET]+[STOP] | reset automation overrider
[PLAY] | play/restart
[SET]+[PLAY] | return to arrangement
[RECORD] | toggle record
[SET]+[RECORD] | arm/disarm track
[CYCLE] | toggle arranger loop
[SET]+[CYCLE] | toggle between Native Mode and Default Mode
[PREV MARKER] | select previous remote controls page
[NEXT MARKER] | select next remote controls page
[SET]+[PREV MARKER] | select previous device in chain
[SET]+[NEXT MARKER] | select next device in chain
[PREV TRACK] | select previous track
[NEXT TRACK] | select next track
[SET]+[PREV TRACK] | scroll track bank up
[SET]+[NEXT TRACK] | scroll track bank down
[SET]+[PREV TRACK]+[NEXT TRACK] | toggle between Mixer Mode and Control Mode (Native Mode only)

Control Mode
---

Buttons | Actions
-- | --
[KNOB n] | modify n-th parameter on currently selected device and parameter page
[SET]+[KNOB n] | reset n-th parameter on currently selected device and parameter page
[SOLO n] | select n-th parameter page
[MUTE n] | select n-th drum pad bank (Native Mode only)

Mixer Mode
---

Buttons | Actions
-- | --
[KNOB n] | change n-th track's pan
[SET]+[KNOB n] reset n-th track's pan
[SLIDER n] | change n-th track's volume
[SET]+[SLIDER n] | reset n-th track's volume
[SOLO n] | toggle n-th track's solo
[MUTE n] | toggle n-th track's mute
[REC n] | toggle n-th track rec
