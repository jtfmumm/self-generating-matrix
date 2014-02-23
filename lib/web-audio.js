var webAudio = (function() {

    var ctx = new webkitAudioContext();

    var channels = {};

    function Osc(parameters) {
    	this.osc = ctx.createOscillator();
        this.node = this.osc;
    	this.osc.type = parameters.type; //e.g. 'square'
    }
    Osc.prototype.play = function(freq, ticks) {
    	this.osc.frequency.value = freq;
        this.osc.start(ticks);
    };
    Osc.prototype.connect = function(target) {
        this.osc.connect(target);
    };

    function Envelope(parameters) {
        this.attack = parameters.attack || 0;
        this.decay = parameters.decay || 0;
        this.sustain = parameters.sustain || 0;
        this.release = parameters.release || 0;
        this.node = ctx.createGain();
        this.gain = this.node.gain;
    }
    Envelope.prototype.filter = function(startTime, dur, amp) {
        this.gain.value = 0;
        this.gain.linearRampToValueAtTime(0, startTime); //Attack
        this.gain.linearRampToValueAtTime(amp, startTime + this.attack); //Attack
        this.gain.linearRampToValueAtTime(amp, startTime + dur + this.attack); //Sustain
        this.gain.linearRampToValueAtTime(0.0, startTime + dur + this.attack + this.release); //Release       
    };

    function Instrument(parameters) {
        this.parameters = parameters;
    }
    Instrument.prototype.play = function(note, timeInSeconds) {    
        this.osc = new Osc(this.parameters.osc);
        this.envelope = new Envelope(this.parameters.envelope);
        this.osc.node.connect(this.envelope.node);
        this.envelope.node.connect(ctx.destination);

        var amp = normalizeGain(note.getVelocity());
        this.osc.play(note.getFreq(), timeInSeconds);
        this.envelope.filter(timeInSeconds, note.getDurationInSeconds(), amp);
    };

    function assignChannel(channelNumber, instrument) {
        channels[channelNumber] = instrument;
    }

    function normalizeGain(gain) {
        return (gain / 127) / 100; //Scales between 0.00 and 0.02
    }

 
    //Set up initial instruments
    var inst0 = {
        osc: {
            type: 'square'
        },
        envelope: {
            attack: .050,
            decay: 0,
            sustain: .10,
            release: .10
        }
    };

    var inst1 = {
        osc: {
            type: 'sawtooth'
        },
        envelope: {
            attack: .10,
            decay: 0,
            sustain: .10,
            release: .10
        }
    };

    var inst2 = {
        osc: {
            type: 'triangle'
        },
        envelope: {
            attack: .10,
            decay: 0,
            sustain: 0,
            release: .10
        }
    };

    var inst3 = {
        osc: {
            type: 'square'
        },
        envelope: {
            attack: 0,
            decay: 0,
            sustain: .10,
            release: .10
        }
    };

    channels[0] = new Instrument(inst0);
    channels[1] = new Instrument(inst1);
    channels[2] = new Instrument(inst2);
    channels[3] = new Instrument(inst3);



    var wa = {
        channels: channels,
        assignChannel: assignChannel,
        Instrument: Instrument,
        Envelope: Envelope,
        Osc: Osc,
        ctx: ctx
    };

    return wa;
})();

/*
Instrument Parameters: {
    osc: {
        type: 'square'
    }
    envelope: {
        attack: ,
        decay: ,
        sustain: ,
        release:
    }
}
*/


