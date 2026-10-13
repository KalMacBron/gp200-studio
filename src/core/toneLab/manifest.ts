// Extracted from FINAL_PROMPT v12.1 (synced filename v12.3). Source remains read-only.
export const toneManifest: { hash: string; chain: string[]; maps: Record<string, Record<string, string[]>>; eq: Record<string, Record<string, number[]>>; cabs: string[] } = {
  "hash": "ffe5143d52d7348918475543a47ac2608f1b4a1783c92b21aadca3c2909cbdbb",
  "chain": [
    "NR",
    "PRE",
    "WAH",
    "DST",
    "AMP",
    "CAB",
    "EQ",
    "MOD",
    "DLY",
    "RVB"
  ],
  "maps": {
    "NR": {
      "Gate 1": [
        "THRESHOLD"
      ],
      "Gate 2": [
        "THRESHOLD",
        "ATTACK",
        "RELEASE"
      ],
      "Gate 3": [
        "THRESHOLD",
        "RATIO",
        "ATTACK_MS",
        "RELEASE_MS",
        "HOLD_MS",
        "HYSTERESIS_DB"
      ],
      "Auto Swell": [
        "ATTACK",
        "CURVE"
      ]
    },
    "PRE": {
      "COMP": [
        "SUSTAIN",
        "VOLUME"
      ],
      "COMP4": [
        "SUSTAIN",
        "ATTACK",
        "VOLUME",
        "CLIPPING"
      ],
      "S-Comp": [
        "THRESHOLD",
        "RATIO",
        "VOLUME",
        "ATTACK",
        "RELEASE",
        "BLEND",
        "TONE"
      ],
      "Micro Boost": [
        "GAIN"
      ],
      "AC Boost": [
        "GAIN",
        "VOLUME",
        "BASS",
        "TREBLE"
      ],
      "B-Boost": [
        "GAIN",
        "VOLUME",
        "BASS",
        "TREBLE"
      ],
      "P-Boost": [
        "GAIN",
        "VOLUME",
        "BASS",
        "TREBLE"
      ],
      "14 Boost": [
        "GAIN"
      ],
      "FAT BB": [
        "VOLUME",
        "BASS",
        "TREBLE",
        "LOW_CUT"
      ],
      "Boost": [
        "VOLUME",
        "PLUS_3DB",
        "BRIGHT"
      ],
      "OD 9": [
        "GAIN",
        "TONE",
        "VOLUME"
      ],
      "Yellow OD": [
        "GAIN",
        "VOLUME"
      ],
      "Penesas": [
        "GAIN",
        "TONE",
        "VOLUME"
      ],
      "Super OD": [
        "GAIN",
        "TONE",
        "VOLUME"
      ],
      "Blues OD": [
        "GAIN",
        "TONE",
        "VOLUME"
      ],
      "AC Refiner": [
        "SHAPE"
      ],
      "AC Sim": [
        "BODY",
        "TOP",
        "VOLUME",
        "MODE",
        "CHARACTERS"
      ],
      "T-Wah": [
        "SENS",
        "RANGE",
        "Q",
        "MIX",
        "MODE"
      ],
      "A-WAH": [
        "DEPTH",
        "RATE",
        "VOLUME",
        "LOW",
        "HIGH",
        "Q",
        "SYNC"
      ],
      "Step Filter": [
        "STEP_1_4",
        "RATE",
        "SYNC"
      ],
      "OCTA": [
        "OCT_1",
        "OCT_2",
        "DRY"
      ],
      "Pitch": [
        "LOW_PITCH",
        "HI_PITCH",
        "DRY",
        "LOW_VOLUME",
        "HIGH_VOLUME"
      ],
      "P-Bend": [
        "LOW_PITCH",
        "HI_PITCH",
        "WET",
        "DRY",
        "RANGE"
      ],
      "Hammy": [
        "RANGE",
        "HARMONY",
        "VOLUME",
        "POSITION"
      ],
      "Harmonizer 1": [
        "MIX",
        "KEY",
        "MODE",
        "INTERVAL",
        "SMOOTH_MODE"
      ],
      "Harmonizer 2": [
        "MIX",
        "KEY",
        "MODE",
        "INTERVAL_1",
        "INTERVAL_2",
        "SMOOTH_MODE"
      ],
      "Ring Mod": [
        "MIX",
        "FREQ",
        "FINE",
        "TONE"
      ],
      "Saturate": [
        "SATURATION",
        "MIX",
        "VOLUME",
        "HIGH_CUT"
      ],
      "Auto Swell": [
        "ATTACK",
        "CURVE"
      ],
      "Hold": [
        "VOLUME",
        "ACTIVATE"
      ],
      "Freeze": [
        "VOLUME",
        "ATTACK",
        "RELEASE",
        "ACTIVATE"
      ]
    },
    "WAH": {
      "V-Wah": [
        "RANGE",
        "Q",
        "VOLUME"
      ],
      "C-Wah": [
        "RANGE",
        "Q",
        "VOLUME"
      ],
      "P-Wah": [
        "RANGE",
        "Q",
        "VOLUME",
        "EQ"
      ],
      "S-Wah": [
        "RANGE",
        "Q",
        "VOLUME"
      ],
      "B-Wah": [],
      "Hammy": [
        "RANGE",
        "HARMONY",
        "VOLUME",
        "POSITION"
      ]
    },
    "DST": {
      "Green OD": [
        "GAIN",
        "TONE",
        "VOLUME"
      ],
      "OD 9": [
        "GAIN",
        "TONE",
        "VOLUME"
      ],
      "Yellow OD": [
        "GAIN",
        "VOLUME"
      ],
      "Penesas": [
        "GAIN",
        "TONE",
        "VOLUME"
      ],
      "Swarm": [
        "GAIN",
        "TONE",
        "VOLUME"
      ],
      "Super OD": [
        "GAIN",
        "TONE",
        "VOLUME"
      ],
      "Scream OD": [
        "GAIN",
        "VOLUME",
        "TONE",
        "FAT",
        "AIR"
      ],
      "Blues OD": [
        "GAIN",
        "TONE",
        "VOLUME"
      ],
      "Force": [
        "GAIN",
        "TONE",
        "VOLUME",
        "MODE",
        "SOUND_CHARACTERS"
      ],
      "Tube": [
        "GAIN",
        "VOLUME",
        "BASS",
        "TREBLE"
      ],
      "Blues Master": [
        "GAIN",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Master OD": [
        "GAIN",
        "TONE",
        "VOLUME"
      ],
      "TaiChi OD": [
        "GAIN",
        "TONE",
        "VOLUME",
        "VOICE"
      ],
      "Timmy OD": [
        "GAIN",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Precise OD": [
        "GAIN",
        "TONE",
        "VOLUME",
        "GATE"
      ],
      "Empire OD": [
        "GAIN",
        "TONE",
        "VOLUME",
        "MODE"
      ],
      "Lazaro": [
        "SUSTAIN",
        "TONE",
        "VOLUME"
      ],
      "Red Haze": [
        "FUZZ",
        "VOLUME"
      ],
      "Sora Fuzz": [
        "FUZZ",
        "VOLUME"
      ],
      "Plustortion": [
        "GAIN",
        "VOLUME"
      ],
      "SM Dist": [
        "GAIN",
        "TONE",
        "VOLUME"
      ],
      "Darktale": [
        "GAIN",
        "FILTER",
        "VOLUME"
      ],
      "Chief": [
        "GAIN",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Master Dist": [
        "GAIN",
        "VOLUME",
        "BASS_CONTOUR_TREBLE"
      ],
      "La Charger": [
        "GAIN",
        "TONE",
        "VOLUME"
      ],
      "Revolt": [
        "GAIN",
        "TONE",
        "VOLUME",
        "MODE",
        "CHARACTERS"
      ],
      "Flagman Dist": [
        "GAIN",
        "VOLUME",
        "BASS",
        "TREBLE",
        "PRESENCE",
        "TIGHT"
      ],
      "Flex OD": [
        "GAIN",
        "TONE",
        "VOLUME",
        "MODE",
        "CHARACTERS",
        "BLEND"
      ],
      "Bass OD": [
        "GAIN",
        "BLEND",
        "VOLUME",
        "BASS",
        "TREBLE"
      ],
      "Black Bass": [
        "GAIN",
        "BLEND",
        "VOLUME",
        "LOW_LO_MID_HI_MID_TREBLE",
        "FLAT"
      ],
      "Bass Hammer": [
        "GAIN",
        "MASTER",
        "BASS",
        "MIDDLE",
        "TREBLE",
        "MID_FREQ",
        "DRIVE"
      ],
      "Micro Boost": [
        "GAIN"
      ],
      "AC Boost": [
        "GAIN",
        "VOLUME",
        "BASS",
        "TREBLE"
      ],
      "B-Boost": [
        "GAIN",
        "VOLUME",
        "BASS",
        "TREBLE"
      ],
      "P-Boost": [
        "GAIN",
        "VOLUME",
        "BASS",
        "TREBLE"
      ],
      "14 Boost": [
        "GAIN"
      ],
      "FAT BB": [
        "VOLUME",
        "BASS",
        "TREBLE",
        "LOW_CUT"
      ],
      "Boost": [
        "VOLUME",
        "PLUS_3DB",
        "BRIGHT"
      ]
    },
    "AMP": {
      "Tweedy Clean": [
        "GAIN",
        "TONE",
        "VOLUME"
      ],
      "Bellman 59N": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Bellman 59B": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Dark Twin": [
        "GAIN",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE",
        "BRIGHT"
      ],
      "Dark DLX": [
        "GAIN",
        "VOLUME",
        "BASS",
        "TREBLE"
      ],
      "Dark Vibra": [
        "GAIN",
        "VOLUME",
        "BASS",
        "TREBLE",
        "BRIGHT"
      ],
      "Silver Twin": [
        "GAIN",
        "VOLUME",
        "BASS",
        "TREBLE"
      ],
      "SUPDual CL": [
        "GAIN",
        "VOLUME",
        "TONE"
      ],
      "SUPDual OD": [
        "GAIN_1",
        "GAIN_2",
        "TONE_1",
        "TONE_2",
        "VOLUME"
      ],
      "Foxy 15TB": [
        "GAIN",
        "TONE",
        "VOLUME",
        "BASS",
        "TREBLE"
      ],
      "Foxy 30N": [
        "GAIN",
        "VOLUME",
        "TONE_CUT",
        "BRIGHT"
      ],
      "Foxy 30TB": [
        "GAIN",
        "TONE_CUT",
        "VOLUME",
        "BASS",
        "TREBLE",
        "CHAR",
        "CHARACTERS"
      ],
      "J-120 CL": [
        "GAIN",
        "BRIGHT",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Match CL": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Match OD": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "L-Star CL": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "L-Star OD": [
        "INPUT",
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "BogSV CL": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "TREBLE",
        "BRIGHT"
      ],
      "BogSV OD": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Bog BlueV": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Bog BlueM": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Bog RedV": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Bog RedM": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Z38 CL": [
        "GAIN",
        "TONE_CUT",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Z38 OD": [
        "GAIN",
        "TONE_CUT",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Knights CL": [
        "GAIN",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Knights CL+": [
        "GAIN",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Knights OD": [
        "GAIN",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Bad-KT CL": [
        "GAIN",
        "PRESENCE",
        "VOLUME"
      ],
      "Bad-KT OD": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "EDGE",
        "BASS",
        "TREBLE"
      ],
      "Solo100 CL": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Solo100 OD": [],
      "Solo100 LD": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "UK 45": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "UK 45+": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "UK 45JP": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "UK 50": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "UK 50+": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "UK 50JP": [
        "GAIN_1",
        "GAIN_2",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "UK SLP": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "UK 800": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "UK 900": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Flagman 1": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Flagman 2": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Flagman+ 1": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Flagman+ 2": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Mess2C+ 1": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Mess2C+ 2": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Mess2C+ 3": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Mess4 LD": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Mess4 LD 2": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Mess4 LD 3": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Mess DualV": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Mess DualM": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Juice30 OD": [
        "GAIN",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Juice R100": [
        "GAIN",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE",
        "BRIGHT"
      ],
      "EV 51": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Eagle 120": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Eagle 120+": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Power LD": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Dizz VH": [
        "GAIN",
        "PRESENCE",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Dizz VH S": [],
      "Dizz VH+": [],
      "Dizz VH+ S": [],
      "Classic Bass": [
        "GAIN",
        "MIDRANGE",
        "FREQUENCY_OF_MIDRANGE_CONTROL",
        "VOLUME",
        "BASS_MIDRANGE_TREBLE"
      ],
      "Foxy Bass": [
        "VOLUME",
        "BASS",
        "TREBLE"
      ],
      "Mess Bass": [
        "GAIN",
        "VOLUME",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "Mini Bass": [
        "VOLUME",
        "BASS",
        "TREBLE"
      ],
      "Bass Pre": [
        "VOLUME",
        "BRIGHT",
        "BASS",
        "MIDDLE",
        "TREBLE"
      ],
      "AC Pre": [
        "VOLUME",
        "TONE",
        "BALANCE",
        "EQ_FREQ",
        "EQ_Q",
        "EQ_GAIN"
      ],
      "AC Pre 2": [
        "VOLUME",
        "TONE",
        "BALANCE",
        "EQ_FREQ",
        "EQ_Q",
        "EQ_GAIN"
      ]
    },
    "CAB": {
      "ALL": [
        "VOLUME",
        "LOW_CUT_HZ",
        "HI_CUT_HZ"
      ]
    },
    "EQ": {
      "Guitar EQ 1": [
        "BAND1_125HZ",
        "BAND2_400HZ",
        "BAND3_800HZ",
        "BAND4_1K6",
        "BAND5_4KHZ",
        "VOLUME"
      ],
      "Guitar EQ 2": [
        "BAND1_100HZ",
        "BAND2_500HZ",
        "BAND3_1KHZ",
        "BAND4_3KHZ",
        "BAND5_6KHZ",
        "VOLUME"
      ],
      "Bass EQ 1": [
        "BAND1_33HZ",
        "BAND2_150HZ",
        "BAND3_600HZ",
        "BAND4_2KHZ",
        "BAND5_8KHZ",
        "VOLUME"
      ],
      "Bass EQ 2": [
        "BAND1_50HZ",
        "BAND2_120HZ",
        "BAND3_400HZ",
        "BAND4_800HZ",
        "BAND5_4500HZ",
        "VOLUME"
      ],
      "Mess EQ": [
        "BAND1_80HZ",
        "BAND2_240HZ",
        "BAND3_750HZ",
        "BAND4_2200HZ",
        "BAND5_6600HZ",
        "VOLUME"
      ],
      "Hyper EQ": [
        "BAND1_31HZ",
        "BAND2_63HZ",
        "BAND3_125HZ",
        "BAND4_250HZ",
        "BAND5_500HZ",
        "BAND6_1KHZ",
        "BAND7_2KHZ",
        "BAND8_4KHZ",
        "BAND9_8KHZ",
        "BAND10_16KHZ",
        "VOLUME"
      ]
    },
    "MOD": {
      "A-Chorus": [
        "DEPTH",
        "RATE",
        "TONE",
        "SYNC"
      ],
      "G-Chorus": [
        "DEPTH",
        "RATE",
        "VOLUME",
        "SYNC"
      ],
      "C-Chorus": [
        "MODE"
      ],
      "B-Chorus": [
        "DEPTH",
        "RATE",
        "VOLUME",
        "SYNC"
      ],
      "M-Chorus": [
        "MIX",
        "RATE",
        "FILTER",
        "DEPTH_L",
        "DEPTH_C",
        "DEPTH_R",
        "SYNC"
      ],
      "Jet Flanger": [
        "DEPTH",
        "RATE",
        "PRE_DELAY",
        "FEEDBACK",
        "SYNC"
      ],
      "B-Jet": [
        "DEPTH",
        "RATE",
        "PRE_DELAY",
        "FEEDBACK",
        "SYNC"
      ],
      "N-Jet": [
        "DEPTH",
        "RATE",
        "PRE_DELAY",
        "FEEDBACK",
        "SYNC"
      ],
      "Trem Jet": [
        "FLG_DEPTH",
        "FLG_RATE",
        "FEEDBACK",
        "TRM_DEPTH",
        "TRM_RATE",
        "FLG_SYNC",
        "TRM_SYNC"
      ],
      "V-Roto": [
        "DEPTH",
        "RATE",
        "SYNC"
      ],
      "G-Roto": [
        "DEPTH",
        "RATE",
        "VOLUME",
        "SYNC"
      ],
      "Vibrato": [
        "DEPTH",
        "RATE",
        "VOLUME",
        "SYNC"
      ],
      "Vibrato T": [
        "SENS",
        "RATE",
        "OUTPUT",
        "SYNC"
      ],
      "O-Phase": [
        "RATE",
        "SYNC"
      ],
      "G-Phase": [
        "DEPTH",
        "RATE",
        "SYNC"
      ],
      "S-Phase": [
        "RATE",
        "SYNC",
        "CHAR"
      ],
      "Pan Phase": [
        "PAN_DEPTH",
        "PAN_RATE",
        "PHASER_DEPTH",
        "PHASER_RATE",
        "PHS_SYNC",
        "PAN_SYNC"
      ],
      "M-Vibe": [
        "DEPTH",
        "RATE",
        "SYNC"
      ],
      "Vibe": [
        "DEPTH",
        "RATE",
        "VOLUME",
        "MODE",
        "SYNC"
      ],
      "O-Trem": [
        "DEPTH",
        "RATE",
        "SYNC"
      ],
      "Sine Trem": [
        "DEPTH",
        "RATE",
        "VOLUME",
        "SYNC"
      ],
      "Bias Trem": [
        "DEPTH",
        "RATE",
        "VOLUME",
        "SYNC",
        "BIAS"
      ],
      "Detune": [
        "DRY_WET",
        "DETUNE"
      ],
      "Bit Smash": [
        "MIX",
        "KRUSH",
        "BIT",
        "HI_CUT",
        "LO_CUT"
      ],
      "Auto Swell": [
        "ATTACK",
        "CURVE"
      ],
      "Hold": [
        "VOLUME",
        "ACTIVATE"
      ],
      "Freeze": [
        "VOLUME",
        "ATTACK",
        "RELEASE",
        "ACTIVATE"
      ]
    },
    "DLY": {
      "BBD Delay S": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "TIME_R_PCT",
        "SPREAD",
        "LEVEL",
        "SYNC",
        "TRAIL"
      ],
      "Digital Delay S": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "TIME_R_PCT",
        "SPREAD",
        "LEVEL",
        "SYNC",
        "TRAIL"
      ],
      "Tape Delay S": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "TIME_R_PCT",
        "SPREAD",
        "FLUTTER",
        "AGE",
        "SCRAPE",
        "DRIVE",
        "LEVEL",
        "SYNC",
        "TRAIL"
      ],
      "Ambience 1": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "LEVEL",
        "MOD",
        "TONE",
        "SYNC",
        "TRAIL"
      ],
      "Ambience 2": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "SYNC",
        "TRAIL"
      ],
      "Pure Delay": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "SYNC",
        "TRAIL"
      ],
      "Analog Delay": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "SYNC",
        "TRAIL"
      ],
      "Tape Delay": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "SYNC",
        "TRAIL"
      ],
      "Ping Pong": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "TRAIL"
      ],
      "Slapback": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "SWEEP_DEPTH",
        "SWEEP_RATE",
        "SWP_SYNC",
        "TIME_SYNC",
        "TRAIL"
      ],
      "Sweep Echo": [
        "DLY_MIX",
        "FEEDBACK",
        "TIME",
        "RING_MIX",
        "FREQ",
        "TONE",
        "SYNC",
        "TRAIL"
      ],
      "Ring Echo": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "SYNC",
        "TRAIL"
      ],
      "Tube Delay": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "TONE",
        "MODE",
        "SYNC",
        "TRAIL"
      ],
      "M-Echo": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "SYNC",
        "TRAIL"
      ],
      "Sweet Echo": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "SYNC",
        "TRAIL"
      ],
      "999 Echo": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "MOD",
        "TONE",
        "SYNC",
        "TRAIL"
      ],
      "Vintage Rack": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "CRUSH",
        "BIT",
        "SYNC",
        "TRAIL"
      ],
      "Lofi Echo": [
        "MIX",
        "FEEDBACK",
        "TIME",
        "VOLUME",
        "SYNC",
        "TRAIL"
      ],
      "Rev Echo": [
        "MIX_A",
        "FB_A",
        "TIME_A",
        "MIX_B",
        "FB_B",
        "TIME_B",
        "A_SYNC",
        "B_SYNC",
        "TRAIL"
      ]
    },
    "RVB": {
      "Room": [
        "MIX",
        "PRE_DELAY",
        "DECAY",
        "TRAIL"
      ],
      "Hall": [
        "MIX",
        "PRE_DELAY",
        "DECAY",
        "TRAIL"
      ],
      "Church": [
        "MIX",
        "PRE_DELAY",
        "DECAY",
        "TRAIL"
      ],
      "Plate": [
        "MIX",
        "DECAY",
        "HIGH_DAMP",
        "TRAIL"
      ],
      "Spring": [
        "MIX",
        "DECAY",
        "TONE",
        "TRAIL"
      ],
      "Tube Spring": [
        "MIX",
        "DECAY",
        "LOW_DAMP",
        "HI_DAMP",
        "MOD",
        "TRAIL"
      ],
      "Amp Spring": [
        "MIX",
        "PRE_DELAY",
        "DECAY",
        "LOW_DAMP",
        "HI_DAMP",
        "MOD",
        "TRAIL"
      ],
      "Studio": [
        "MIX",
        "PRE_DELAY",
        "DECAY",
        "LOW_DAMP",
        "HI_DAMP",
        "MOD",
        "TRAIL"
      ],
      "N-Star": [
        "MIX",
        "DECAY",
        "TRAIL"
      ],
      "Deepsea": [
        "MIX",
        "DECAY",
        "TRAIL"
      ],
      "Sweet Space": [
        "MIX",
        "PRE_DELAY",
        "DECAY",
        "LOW_END",
        "HIGH_END",
        "TRAIL"
      ],
      "Shimmer": [
        "MIX",
        "PRE_DELAY",
        "DECAY",
        "LOW_END",
        "HIGH_END",
        "TRAIL"
      ],
      "Club": [
        "MIX",
        "PRE_DELAY",
        "DECAY",
        "LOW_DAMP",
        "HIGH_DAMP",
        "TRAIL",
        "MOD"
      ],
      "Concert": [
        "MIX",
        "PRE_DELAY",
        "DECAY",
        "LOW_DAMP",
        "HIGH_DAMP",
        "TRAIL",
        "MOD"
      ],
      "Arena": [
        "MIX",
        "PRE_DELAY",
        "DECAY",
        "LOW_DAMP",
        "HIGH_DAMP",
        "TRAIL",
        "MOD"
      ]
    }
  },
  "eq": {
    "Guitar EQ 1": {
      "BAND1_125HZ": [
        -50,
        50
      ],
      "BAND2_400HZ": [
        -50,
        50
      ],
      "BAND3_800HZ": [
        -50,
        50
      ],
      "BAND4_1K6": [
        -50,
        50
      ],
      "BAND5_4KHZ": [
        -50,
        50
      ],
      "VOLUME": [
        -100,
        0
      ]
    },
    "Guitar EQ 2": {
      "BAND1_100HZ": [
        -50,
        50
      ],
      "BAND2_500HZ": [
        -50,
        50
      ],
      "BAND3_1KHZ": [
        -50,
        50
      ],
      "BAND4_3KHZ": [
        -50,
        50
      ],
      "BAND5_6KHZ": [
        -50,
        50
      ],
      "VOLUME": [
        -100,
        0
      ]
    },
    "Hyper EQ": {
      "BAND1_31HZ": [
        -12,
        12
      ],
      "BAND2_63HZ": [
        -12,
        12
      ],
      "BAND3_125HZ": [
        -12,
        12
      ],
      "BAND4_250HZ": [
        -12,
        12
      ],
      "BAND5_500HZ": [
        -12,
        12
      ],
      "BAND6_1KHZ": [
        -12,
        12
      ],
      "BAND7_2KHZ": [
        -12,
        12
      ],
      "BAND8_4KHZ": [
        -12,
        12
      ],
      "BAND9_8KHZ": [
        -12,
        12
      ],
      "BAND10_16KHZ": [
        -12,
        12
      ],
      "VOLUME": [
        -100,
        0
      ]
    }
  },
  "cabs": [
    "AC",
    "AC Dream",
    "ACE",
    "ADM 1",
    "ADM 2",
    "AMPG 1",
    "AMPG 2",
    "Bad-KT",
    "Bellman 1",
    "Bellman 2",
    "Bird",
    "Blue SK",
    "Bog",
    "BogSV",
    "BOUTI",
    "Classic AC",
    "D STAR",
    "Dark CS",
    "Dark LUX",
    "Dark Twin",
    "Dark VIT",
    "DB Rock",
    "Dizz",
    "Double Bass",
    "Dumb",
    "Eagle",
    "EV",
    "F-TOP",
    "FOXY 1",
    "FOXY 2",
    "Freed",
    "Fretless Bass",
    "GA",
    "H-WAY",
    "HACK",
    "J-120",
    "Juice",
    "JUMBO",
    "King",
    "Mandolin",
    "Match",
    "MATT",
    "MATT TWD",
    "Mess",
    "OM",
    "ROUT",
    "Solo",
    "SUP",
    "SUP Star",
    "SUP ZEP",
    "TOM OPEN",
    "TRP",
    "TWD CP",
    "TWD LUX",
    "TWD PRC",
    "TWD SUP",
    "Uban",
    "UK 75",
    "UK Dark",
    "UK G12",
    "UK GRN 1",
    "UK GRN 2",
    "UK LD",
    "UK MD",
    "UK TD",
    "US BASS",
    "US STO",
    "User IR 1~20",
    "Way",
    "Workman 1",
    "Workman 2"
  ]
};
