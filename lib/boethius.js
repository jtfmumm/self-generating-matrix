var boe = (function() {

	var parameters = {
		bpm: 120
	};

	function calculateNoteDurationInSeconds(noteValue) {
		var measureDur = 4 * (60 / parameters.bpm);
		return noteValue * measureDur;
	}

	function ticksToSeconds(ticks) {
		return ticks * (60 / parameters.bpm);
	}


	function Note(name, value, velocity) {
		this.name = name;
		this.value = value; //1 for whole, 0.5 half, 0.25 quarter, etc.
		this.velocity = velocity || 100;  //0-127
		if (this.velocity > 128) this.velocity = 127;
	}
	Note.prototype.display = function() {
		return this.name;
	};
	Note.prototype.getFreq = function(freqTable) {
		var freqTable = freqTable || equalFreqTable; 
		return freqTable[this.name];
	};
	Note.prototype.getVelocity = function() {
		return this.velocity;
	};
	Note.prototype.getDurationInSeconds = function() {
		return calculateNoteDurationInSeconds(this.value);
	};
	Note.prototype.getBeats = function() {
		return this.value;
	};

	function Chord() {}


	function Scheduler(tempo) {
		this.tempo = tempo;
	};
	Scheduler.prototype.beginClock = function() {};
	Scheduler.prototype.scheduleNote = function(note, channel, ticks) {};
	Scheduler.prototype.scheduleChord = function(chord, channel, ticks) {};

	function WebAudioScheduler(tempo) {
		Scheduler.call(this);
	 	this.ctx = null;
	}
	WebAudioScheduler.prototype = Object.create(Scheduler.prototype);
	WebAudioScheduler.prototype.beginClock = function() {
		this.ctx = new webkitAudioContext();
	};
	WebAudioScheduler.prototype.scheduleNote = function(note, channelNumber, ticks) {
		var seconds = ticksToSeconds(ticks);
		webAudio.channels[channelNumber].play(note, seconds);
	};
	WebAudioScheduler.prototype.kill = function() {
	};


	function generateEqualFreqTable(toneNames, octaves, startingFreq, halfStep) {
		var freqTable = {};
		var currentFreq = startingFreq / halfStep;
		for (var i = 0; i < octaves; i++) {
			for (var j = 0; j < toneNames.length; j++) {
				var thisNote = "" + toneNames[j] + i;
				currentFreq *= halfStep;
				freqTable[thisNote] = currentFreq;
				if (/\#$/.test(toneNames[j])) {
					thisNote = toneNames[j + 1] + "b" + i; //e.g. C# replaced by Db
					freqTable[thisNote] = currentFreq;
				}
			}
		}
		console.log(freqTable);
		return freqTable;
	}

	var twelveTones = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

	//C0 = 16.352hz
	var equalFreqTable = generateEqualFreqTable(twelveTones, 7, 16.352, Math.pow(2, 1/12));

	var boe = {
		Note: Note,
		Scheduler: Scheduler,
		WebAudioScheduler: WebAudioScheduler
	};

	return boe;
})();
