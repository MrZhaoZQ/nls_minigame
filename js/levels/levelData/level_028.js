'use strict';

module.exports = {
  "id": 28,
  "name": "大师 28",
  "colors": [
    "red",
    "blue",
    "yellow",
    "green",
    "purple"
  ],
  "slotCount": 6,
  "gridSize": 12,
  "boards": [
    {
      "id": "b1",
      "prefab": "Board_Single",
      "position": [
        -2.3113638611277567,
        0,
        -0.23886614982038734
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b3",
            "b5",
            "b7",
            "b9"
          ]
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b3",
            "b5",
            "b7"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "red",
          "coveredBy": [
            "b3",
            "b5",
            "b7",
            "b9"
          ]
        },
        {
          "id": "h4",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "red",
          "coveredBy": [
            "b3",
            "b5",
            "b7",
            "b9"
          ]
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_Gear",
      "position": [
        2.1935677337693056,
        0,
        0.08972627266775818
      ],
      "rotation": [
        0,
        -20,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "yellow",
          "coveredBy": [
            "b4",
            "b6",
            "b8",
            "b10"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "red",
          "coveredBy": [
            "b4",
            "b6",
            "b8",
            "b10"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "red",
          "coveredBy": [
            "b6",
            "b8",
            "b10"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -0.55,
            0,
            0.95
          ],
          "color": "green",
          "coveredBy": [
            "b6"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "yellow",
          "coveredBy": [
            "b4",
            "b6",
            "b8"
          ]
        }
      ]
    },
    {
      "id": "b3",
      "prefab": "Board_Single",
      "position": [
        -1.7181481375423746,
        1,
        -0.16776241932529956
      ],
      "rotation": [
        0,
        -60,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "red",
          "coveredBy": [
            "b5",
            "b7",
            "b9"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b5",
            "b7",
            "b9"
          ]
        },
        {
          "id": "h3",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "green"
        },
        {
          "id": "h4",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b7",
            "b9"
          ]
        }
      ]
    },
    {
      "id": "b4",
      "prefab": "Board_L",
      "position": [
        2.296223205497444,
        1,
        -0.29779497885610906
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b6",
            "b8",
            "b10"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b6",
            "b8",
            "b10"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b6",
            "b8",
            "b10"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "red",
          "coveredBy": [
            "b6",
            "b8",
            "b10"
          ]
        }
      ]
    },
    {
      "id": "b5",
      "prefab": "Board_Single",
      "position": [
        -1.920947581559375,
        2,
        0.014697462995536648
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b7",
            "b9"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b7",
            "b9"
          ]
        },
        {
          "id": "h3",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "green"
        },
        {
          "id": "h4",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b7",
            "b9"
          ]
        }
      ]
    },
    {
      "id": "b6",
      "prefab": "Board_Single",
      "position": [
        2.0758345968387575,
        2,
        0.3092829666333273
      ],
      "rotation": [
        0,
        60,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "green",
          "coveredBy": [
            "b8",
            "b10"
          ]
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "green"
        },
        {
          "id": "h3",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b8",
            "b10"
          ]
        },
        {
          "id": "h4",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "green"
        }
      ]
    },
    {
      "id": "b7",
      "prefab": "Board_Single",
      "position": [
        -2.625648104845686,
        3,
        -0.0406549286330119
      ],
      "rotation": [
        0,
        20,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "green",
          "coveredBy": [
            "b9"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b9"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b9"
          ]
        }
      ]
    },
    {
      "id": "b8",
      "prefab": "Board_Single",
      "position": [
        2.127836548354616,
        3,
        -0.22085047347936781
      ],
      "rotation": [
        0,
        20,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b10"
          ]
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b10"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b10"
          ]
        },
        {
          "id": "h4",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b10"
          ]
        },
        {
          "id": "h5",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b10"
          ]
        }
      ]
    },
    {
      "id": "b9",
      "prefab": "Board_Single",
      "position": [
        -2.463441912316251,
        4,
        0.2982489410322159
      ],
      "rotation": [
        0,
        40,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "blue"
        },
        {
          "id": "h2",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h3",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "blue"
        },
        {
          "id": "h4",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "green"
        }
      ]
    },
    {
      "id": "b10",
      "prefab": "Board_L",
      "position": [
        1.887599634331185,
        4,
        -0.031489014998078324
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "purple"
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "green"
        },
        {
          "id": "h3",
          "pos": [
            -0.9,
            0,
            -1.1
          ],
          "color": "purple"
        },
        {
          "id": "h4",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "yellow"
        }
      ]
    }
  ],
  "seed": 28021622
};
