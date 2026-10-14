'use strict';

module.exports = {
  "id": 26,
  "name": "大师 26",
  "colors": [
    "red",
    "blue",
    "yellow",
    "green",
    "purple"
  ],
  "slotCount": 6,
  "gridSize": 20,
  "boards": [
    {
      "id": "b1",
      "prefab": "Board_Single",
      "position": [
        -2.3674163045580494,
        0,
        -0.11551296976394951
      ],
      "rotation": [
        0,
        -40,
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
          "color": "blue",
          "coveredBy": [
            "b4",
            "b8",
            "b11"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "green",
          "coveredBy": [
            "b4",
            "b8",
            "b11"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b4",
            "b8",
            "b11"
          ]
        },
        {
          "id": "h4",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "green",
          "coveredBy": [
            "b4",
            "b8"
          ]
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_Single",
      "position": [
        2.1365888454704542,
        0,
        -0.11725736055523156
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
            0,
            0,
            -0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b5",
            "b9",
            "b12"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b5",
            "b9",
            "b12"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b5",
            "b9",
            "b12"
          ]
        },
        {
          "id": "h4",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b9",
            "b12"
          ]
        }
      ]
    },
    {
      "id": "b3",
      "prefab": "Board_Single",
      "position": [
        -6.278554897861465,
        1,
        0.22818778234068304
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
            -1.4,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b7"
          ]
        }
      ]
    },
    {
      "id": "b4",
      "prefab": "Board_Gear",
      "position": [
        -2.093752449461168,
        1,
        -0.2943245656089857
      ],
      "rotation": [
        0,
        -80,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            -0.55,
            0,
            -0.95
          ],
          "color": "red",
          "coveredBy": [
            "b8",
            "b11"
          ]
        },
        {
          "id": "h2",
          "pos": [
            1.1,
            0,
            0
          ],
          "color": "green",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "blue",
          "coveredBy": [
            "b8"
          ]
        }
      ]
    },
    {
      "id": "b5",
      "prefab": "Board_Single",
      "position": [
        2.1434113524621354,
        1,
        -0.11865797261707484
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
            0,
            0,
            0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b9",
            "b12"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b9"
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
            "b9",
            "b12"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b9",
            "b12"
          ]
        }
      ]
    },
    {
      "id": "b6",
      "prefab": "Board_Gear",
      "position": [
        6.2512733841211565,
        1,
        -0.1935269119916484
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
            -0.55,
            0,
            0.95
          ],
          "color": "red",
          "coveredBy": [
            "b10"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "yellow",
          "coveredBy": [
            "b10"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "yellow",
          "coveredBy": [
            "b10"
          ]
        },
        {
          "id": "h4",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "green"
        }
      ]
    },
    {
      "id": "b7",
      "prefab": "Board_Single",
      "position": [
        -6.750833623859986,
        2,
        -0.2076828223420307
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
            0,
            0,
            -0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "red"
        },
        {
          "id": "h3",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "green"
        }
      ]
    },
    {
      "id": "b8",
      "prefab": "Board_Single",
      "position": [
        -2.171128807978749,
        2,
        -0.286119466740638
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
            -0.7,
            0,
            -0.26
          ],
          "color": "blue"
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b11"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "red"
        },
        {
          "id": "h4",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "green"
        }
      ]
    },
    {
      "id": "b9",
      "prefab": "Board_L",
      "position": [
        2.235709808886937,
        2,
        0.29359778470825404
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
            0,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b12"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -1.5,
            0,
            -1.1
          ],
          "color": "blue",
          "coveredBy": [
            "b12"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "red",
          "coveredBy": [
            "b12"
          ]
        }
      ]
    },
    {
      "id": "b10",
      "prefab": "Board_Single",
      "position": [
        6.381342897917098,
        2,
        0.2595266570337117
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
            0,
            0,
            -0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "green"
        },
        {
          "id": "h3",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h4",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "green"
        }
      ]
    },
    {
      "id": "b11",
      "prefab": "Board_Single",
      "position": [
        -2.0454129689140244,
        3,
        0.13205047002993522
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
          "color": "purple"
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "red"
        },
        {
          "id": "h3",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "purple"
        }
      ]
    },
    {
      "id": "b12",
      "prefab": "Board_L",
      "position": [
        1.9907278585480526,
        3,
        0.30924385238904506
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
            -1.5,
            0,
            -1.1
          ],
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "purple"
        },
        {
          "id": "h3",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "green"
        }
      ]
    }
  ],
  "seed": 26021703
};
