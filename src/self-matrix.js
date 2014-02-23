//Self-matrix

function MarkovMatrix(entries) {
	this.entries = entries;
	this.matrix = [];
	this.currentRow = 0;

	for (var i = 0; i < entries.length; i++) {
		this.matrix.push([]);
		for (var j = 0; j < entries.length; j++) 
			this.matrix[i][j] = 1;
	}
}
MarkovMatrix.prototype.changeState = function(state) {
	this.currentRow = this.entries.indexOf(state);
};
MarkovMatrix.prototype.updateCell = function(column, row, newValue) {
	this.matrix[column][row] = newValue;
};
MarkovMatrix.prototype.incrementCellByName = function(columnEntry, rowEntry) {
	var column = this.entries.indexOf(columnEntry);
	var row = this.entries.indexOf(rowEntry);
	var oldValue = this.matrix[column][row];
	this.matrix[column][row] = ++oldValue;
};
MarkovMatrix.prototype.getCellValue = function(column, row) {
	return this.matrix[column][row];
};
MarkovMatrix.prototype.getCurrentRowTotal = function() {
	return _.reduce(this.matrix[this.currentRow], function(a, x) {
		return a + x;
	});
};
MarkovMatrix.prototype.advanceRow = function() {
	var runningTotal = 0;
	var rowTotal = this.getCurrentRowTotal();
	var roll = utilities.roll(rowTotal);

	for (var i = 0; i < this.entries.length; i++) {
		runningTotal += this.matrix[this.currentRow][i];
		if (runningTotal >= roll) { 
			this.currentRow = i;
			return undefined;
		}
	}
};
MarkovMatrix.prototype.getThisState = function() {
	return this.entries[this.currentRow];
};
MarkovMatrix.prototype.getNextState = function() {
	this.advanceRow();
	return this.entries[this.currentRow];
};


function Style(tones, noteValues) {
	var noteValues = noteValues || [1, 1/2, 1/4, 1/8, 1/16];
	this.tones = new MarkovMatrix(tones);
	this.noteValues = new MarkovMatrix(noteValues);
}
Style.prototype.changeTone = function(tone) {
	this.tones.changeState(tone);
};
Style.prototype.getThisTone = function() {
	return this.tones.getThisState();
};
Style.prototype.getNextTone = function() {
	return this.tones.getNextState();
};
Style.prototype.changeNoteValue = function(noteValue) {
	this.noteValues.changeState(noteValue);
};
Style.prototype.getThisNoteValue = function() {
	return this.noteValues.getThisState();
};
Style.prototype.getNextNoteValue = function() {
	return this.noteValues.getNextState();
};


function motifStyle(motifs) {
	this.motifs = new MarkovMatrix(motifs);
	this.repetitions = new MarkovMatrix([1, 2, 3, 4, 5]);
}
motifStyle.prototype.playSequenceWith = function(player) {
	var reps = this.repetitions.getNextState();
	var thisMotif = this.motifs.getNextState();
	for (var i = 0; i < reps; i++) {
		thisMotif.playWith(player);
		player.rest(1);	
	}
};
motifStyle.prototype.playAndUpdate = function(player) {
	var lastMotif = this.motifs.getThisState();
	var lastReps = this.repetitions.getThisState();
	this.playSequenceWith(player);
	var thisMotif = this.motifs.getThisState();
	var thisReps = this.repetitions.getThisState();
	this.incrementMotifCell(lastMotif, thisMotif);
	this.incrementRepetitionsCell(lastReps, thisReps);
}
motifStyle.prototype.incrementMotifCell = function(motif1, motif2) {
	this.motifs.incrementCellByName(motif1, motif2);
};
motifStyle.prototype.incrementRepetitionsCell = function(reps1, reps2) {
	this.repetitions.incrementCellByName(reps1, reps2);
};


function SelfMatrixMaker() {
	boe.WebAudioScheduler.call(this, 120);
}
SelfMatrixMaker.prototype = Object.create(boe.WebAudioScheduler.prototype);
SelfMatrixMaker.prototype.constructor = SelfMatrixMaker;
SelfMatrixMaker.prototype.schedulePart = function(style, octave) {
	var lastNote, lastNoteValue, getNextNoteValue, thisNote, thisNoteValue;
	var n = 1;
	for (var k = 0; k < 100; k++) {
		lastNote = style.getThisTone();
		lastNoteValue = style.getThisNoteValue();
		nextNoteValue = style.getNextNoteValue();
		n += 4 * nextNoteValue;

		this.scheduleNote(new boe.Note(style.getNextTone() + octave, nextNoteValue), 0, n);
		
		thisNote = style.getThisTone();
		thisNoteValue = style.getThisNoteValue();
		console.log(lastNote);
		console.log(thisNote);
		console.log(lastNoteValue);
		console.log(thisNoteValue);
		style.tones.incrementCellByName(lastNote, thisNote);
		style.noteValues.incrementCellByName(lastNoteValue, thisNoteValue);
	}	
}


function Player() {
	this.scheduler = new boe.WebAudioScheduler(120);
	this.currentTick = 1;
}
Player.prototype.playNote = function(note) {
	this.scheduler.scheduleNote(note, 0, this.currentTick);
	this.currentTick += note.getDurationInSeconds();
};
Player.prototype.playMotif = function(motif) {
	motif.playWith(player);
};
Player.prototype.resetClock = function() {
	this.currentTick = 0;
};
Player.prototype.rest = function(restInSeconds) {
	this.currentTick + restInSeconds;
};

function Motif(notes) {
	this.notes = [];

	for (var i = 0; i < notes.length; i++) {
		this.notes.push(notes[i]);
	}
}
Motif.prototype.playWith = function(player) {
	for (var i = 0; i < this.notes.length; i++) {
		player.playNote(this.notes[i]);
	}
};


function createMotif(tones, noteValues, octave, length) {
	var randNoteName, randNoteValue, thisNote;
	var motif = [];
	for (var i = 0; i < length; i++) {
		randNoteName = utilities.getRandElement(tones);
		randNoteValue = utilities.getRandElement(noteValues);
		thisNote = new boe.Note(randNoteName + octave, randNoteValue);
		motif.push(thisNote);
	}
	return new Motif(motif);
}

function createMotifsArray(tones, noteValues, octave, noteAmount, numberOfMotifs) {
	var arr = [];
	for (var i = 0; i < numberOfMotifs; i++) {
		arr.push(createMotif(tones, noteValues, octave, noteAmount));
	}
	return arr;
}


var twelveTones = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

var dMajor = ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'];
var aBebop = ['A', 'B', 'C#', 'D', 'E', 'F#', 'G', 'G#'];
var gBebop = ['G', 'A', 'B', 'C', 'D', 'E', 'F', 'F#'];
var dMinor = ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'];

var noteValues = [0.25, 0.125, 0.0625];

var treble = new Style(dMajor, noteValues);
var bass = new Style(dMajor, noteValues);

var song = new SelfMatrixMaker();
//song.schedulePart(treble, 4);
//song.schedulePart(bass, 3);

var player = new Player();

var trebMo = new motifStyle(createMotifsArray(twelveTones, noteValues, 4, 7, 6)); 
var bassMo = new motifStyle(createMotifsArray(twelveTones, noteValues, 3, 7, 6)); 

for (var i = 0; i < 20; i++) 
	trebMo.playAndUpdate(player);

player.resetClock();
for (var i = 0; i < 20; i++) 
	bassMo.playAndUpdate(player);


/*
var trebMo = createMotif(dMajor, noteValues, 4, 6);
var bassMo = createMotif(dMinor, noteValues, 3, 6);

player.playMotif(trebMo);
player.rest(1);
player.playMotif(trebMo);
player.rest(1);
player.playMotif(trebMo);
player.rest(1);
player.playMotif(trebMo);
player.rest(1);
player.playMotif(trebMo);
player.rest(1);

player.resetClock()
player.playMotif(bassMo);
player.rest(1);
player.playMotif(bassMo);
player.rest(1);
player.playMotif(bassMo);
player.rest(1);
player.playMotif(bassMo);
player.rest(1);
player.playMotif(bassMo);
player.rest(1);
*/
//player.playNote(new beo.Note(''));


//song.scheduleSong();






function playNextNote(lastNote) {}

function playMatrix() {}