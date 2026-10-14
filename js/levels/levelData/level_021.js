'use strict';

module.exports = {
  "id": 21,
  "name": "挑战 21",
  "colors": [
    "red",
    "blue",
    "yellow",
    "green",
    "purple"
  ],
  "slotCount": 5,
  "gridSize": 10,
  "boards": [
    {
      "id": "b1",
      "prefab": "Board_Gear",
      "position": [
        -2.351178170065396,
        0,
        0.002376134600490354
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
            -0.55,
            0,
            0.95
          ],
          "color": "yellow",
          "coveredBy": [
            "b3",
            "b5",
            "b7"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -1.1,
            0,
            0
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
            0.55,
            0,
            0
          ],
          "color": "green",
          "coveredBy": [
            "b3",
            "b5",
            "b7"
          ]
        },
        {
          "id": "h4",
          "pos": [
            1.1,
            0,
            0
          ],
          "color": "green",
          "coveredBy": [
            "b3",
            "b5",
            "b7"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "red",
          "coveredBy": [
            "b3",
            "b5",
            "b7"
          ]
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_Single",
      "position": [
        1.857249770010822,
        0,
        0.15744263140950354
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
            -0.7,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b4",
            "b6",
            "b8"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b4",
            "b6",
            "b8"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b4",
            "b6",
            "b8"
          ]
        },
        {
          "id": "h4",
          "pos": [
            1.4,
            0,
            0.26
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
      "prefab": "Board_L",
      "position": [
        -2.278785883286037,
        1,
        0.3461788470856845
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
          "color": "red",
          "coveredBy": [
            "b5",
            "b7"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "red",
          "coveredBy": [
            "b5",
            "b7"
          ]
        },
        {
          "id": "h3",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b5",
            "b7"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "red",
          "coveredBy": [
            "b5",
            "b7"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b5",
            "b7"
          ]
        },
        {
          "id": "h6",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b5",
            "b7"
          ]
        }
      ]
    },
    {
      "id": "b4",
      "prefab": "Board_Gear",
      "position": [
        2.4040910651208836,
        1,
        -0.29608915094286203
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
            0.55,
            0,
            0
          ],
          "color": "blue",
          "coveredBy": [
            "b6",
            "b8"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.55,
            0,
            0
          ],
          "color": "blue",
          "coveredBy": [
            "b6",
            "b8"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -0.55,
            0,
            0.95
          ],
          "color": "green",
          "coveredBy": [
            "b6",
            "b8"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -0.55,
            0,
            -0.95
          ],
          "color": "green",
          "coveredBy": [
            "b6",
            "b8"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "yellow",
          "coveredBy": [
            "b6",
            "b8"
          ]
        }
      ]
    },
    {
      "id": "b5",
      "prefab": "Board_L",
      "position": [
        -2.0224847601959484,
        2,
        0.06612499384209514
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
          "color": "blue",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "green",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h3",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "green",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h4",
          "pos": [
            1.4,
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
      "id": "b6",
      "prefab": "Board_Gear",
      "position": [
        2.0753168286755685,
        2,
        0.3158808702137321
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
            -0.55,
            0,
            -0.95
          ],
          "color": "purple",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.55,
            0,
            0.95
          ],
          "color": "purple",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -0.55,
            0,
            0
          ],
          "color": "red",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h4",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "blue",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h5",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "red",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h6",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "yellow",
          "coveredBy": [
            "b8"
          ]
        }
      ]
    },
    {
      "id": "b7",
      "prefab": "Board_Gear",
      "position": [
        -2.304219194292091,
        3,
        0.17079770127311347
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
            0
          ],
          "color": "purple"
        },
        {
          "id": "h2",
          "pos": [
            -0.55,
            0,
            -0.95
          ],
          "color": "purple"
        },
        {
          "id": "h3",
          "pos": [
            1.1,
            0,
            0
          ],
          "color": "blue"
        },
        {
          "id": "h4",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "yellow"
        }
      ]
    },
    {
      "id": "b8",
      "prefab": "Board_Gear",
      "position": [
        2.241768738999963,
        3,
        -0.1952813421143219
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
            1.1,
            0,
            0
          ],
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            -0.55,
            0,
            0
          ],
          "color": "purple"
        },
        {
          "id": "h3",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "purple"
        },
        {
          "id": "h4",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "red"
        },
        {
          "id": "h5",
          "pos": [
            -0.55,
            0,
            0.95
          ],
          "color": "yellow"
        }
      ]
    }
  ],
  "seed": 21000026
};
