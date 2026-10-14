'use strict';

module.exports = {
  "id": 4,
  "name": "新手 4",
  "colors": [
    "red",
    "blue",
    "yellow",
    "green"
  ],
  "slotCount": 5,
  "gridSize": 6,
  "boards": [
    {
      "id": "b1",
      "prefab": "Board_Single",
      "position": [
        -0.09141056470107284,
        0,
        -0.01614058078266678
      ],
      "rotation": [
        0,
        90,
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
          "color": "blue"
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
            "b2",
            "b3"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "red"
        },
        {
          "id": "h4",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h5",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "green"
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_Single",
      "position": [
        -0.06233499858062713,
        1,
        -0.044020361779257666
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
            "b3"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b3"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "green"
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
            "b3"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b3"
          ]
        },
        {
          "id": "h6",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b3"
          ]
        },
        {
          "id": "h7",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "red"
        }
      ]
    },
    {
      "id": "b3",
      "prefab": "Board_Single",
      "position": [
        0.2626184290042147,
        2,
        -0.2787687591742724
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
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "blue"
        },
        {
          "id": "h3",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "green"
        },
        {
          "id": "h4",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "red"
        },
        {
          "id": "h5",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "blue"
        },
        {
          "id": "h6",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "red"
        }
      ]
    }
  ],
  "seed": 4000000
};
