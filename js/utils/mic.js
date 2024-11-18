function Microphone(_fft) {
    var FFT_SIZE = _fft || 1024;
    this.spectrum_size = FFT_SIZE / 2;
    this.spectrum = [];
    this.volume = this.vol = 0;
    this.peak_volume = 0;

    var self = this;
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var SAMPLE_RATE = audioContext.sampleRate;

    window.addEventListener('load', init, false);

    function init() {
        try {
            if (audioContext.state === 'suspended') {
                document.addEventListener('click', () => {
                    audioContext.resume();
                }, { once: true });
            }
            startMic(audioContext);
        } catch (e) {
            console.error(e);
            alert('Web Audio API is not supported in this browser');
        }
    }

    function startMic(context) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(processSound)
            .catch(error);

        function processSound(stream) {
            var analyser = context.createAnalyser();
            analyser.smoothingTimeConstant = 0.2;
            analyser.fftSize = FFT_SIZE;

            var node = context.createScriptProcessor(FFT_SIZE * 2, 1, 1);
            node.onaudioprocess = function () {
                self.spectrum = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(self.spectrum);
                self.vol = self.getRMS(self.spectrum);
                if (self.vol > self.peak_volume) self.peak_volume = self.vol;
                self.volume = self.vol;
            };

            var input = context.createMediaStreamSource(stream);
            input.connect(analyser);
            analyser.connect(node);
            node.connect(context.destination);
        }

        function error(err) {
            console.error('Error accessing microphone:', err);
        }
    }

    this.mapSound = function (_me, _total, _min, _max) {
        if (self.spectrum.length > 0) {
            var min = _min || 0;
            var max = _max || 100;
            var new_freq = Math.round(_me / _total * self.spectrum.length);
            return map(self.spectrum[new_freq], 0, self.peak_volume, min, max);
        } else {
            return 0;
        }
    };

    this.getVol = function (_min, _max) {
        var min_max = _min || 100;
        var min = _min || 0;
        var max = _max || min_max;
        self.volume = map(self.vol, 0, self.peak_volume, min, max);
        return self.volume || 0;
    };

    this.getVolume = function () { return this.getVol(); };

    this.getRMS = function (spectrum) {
        var rms = 0;
        for (var i = 0; i < spectrum.length; i++) {
            rms += spectrum[i] * spectrum[i];
        }
        rms /= spectrum.length;
        return Math.sqrt(rms);
    };

    function mapFreq(i) {
        var freq = i * SAMPLE_RATE / self.spectrum.length;
        return freq;
    }

    this.getMix = function () {
        var highs = [];
        var mids = [];
        var bass = [];
        for (var i = 0; i < self.spectrum.length; i++) {
            var band = mapFreq(i);
            var v = map(self.spectrum[i], 0, self.peak_volume, 0, 100);
            if (band < 500) {
                bass.push(v);
            }
            if (band > 400 && band < 6000) {
                mids.push(v);
            }
            if (band > 4000) {
                highs.push(v);
            }
        }
        return { bass: bass, mids: mids, highs: highs };
    };

    this.getBass = function () {
        return this.getMix().bass;
    };

    this.getMids = function () {
        return this.getMix().mids;
    };

    this.getHighs = function () {
        return this.getMix().highs;
    };

    this.getHighsVol = function (_min, _max) {
        var min = _min || 0;
        var max = _max || 100;
        return map(this.getRMS(this.getMix().highs), 0, self.peak_volume, min, max);
    };

    this.getMidsVol = function (_min, _max) {
        var min = _min || 0;
        var max = _max || 100;
        return map(this.getRMS(this.getMix().mids), 0, self.peak_volume, min, max);
    };

    this.getBassVol = function (_min, _max) {
        var min = _min || 0;
        var max = _max || 100;
        return map(this.getRMS(this.getMix().bass), 0, self.peak_volume, min, max);
    };

    return this;
}

var Sound = new Microphone();
console.log(Sound);
