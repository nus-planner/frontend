const str = `{
  "CS-2019": {
    "and": [
      {
        "ulr": {
          "state": "overallDegreeState",
          "title": "University Level Requirements",
          "and": [
            {
              "geh": {
                "title": "GEH modules",
                "module": {
                  "code_pattern": "^GEH"
                }
              }
            },
            "GEQ1000",
            "GER1000",
            {
              "ges": {
                "title": "GES modules",
                "module": {
                  "code_pattern": "^GES"
                }
              }
            },
            {
              "get": {
                "module": {
                  "code_pattern": "^GET"
                }
              }
            }
          ]
        }
      },
      {
        "cs_foundation": {
          "state": "overallDegreeState",
          "title": "CS foundation",
          "and": [
            {
              "cs1010": {
                "title": "CS1010 variants",
                "or": ["CS1101S", "CS1010X"]
              }
            },
            "CS1231S",
            "CS2030S",
            "CS2040S",
            "CS2100",
            "CS2103T",
            "CS2105",
            "CS2106",
            "CS3230"
          ]
        }
      },
      {
        "cs_team_project": {
          "state": "overallDegreeState",
          "or": [
            "CS3203",
            {
              "CS3216/17 combo": {
                "and": ["CS3216", "CS3217"]
              }
            },
            {
              "CS3281/82 combo": {
                "and": ["CS3281", "CS3282"]
              }
            }
          ]
        }
      },
      {
        "it_professionalism": {
          "state": "overallDegreeState",
          "and": [
            {
              "": {
                "or": ["IS1103", "IS1108"]
              }
            },
            "CS2101",
            "ES2660"
          ]
        }
      },
      {
        "cs_industry_exp": {
          "state": "overallDegreeState",
          "or": [
            "CP3880",
            {
              "": {
                "and": ["CP3200", "CP3202"]
              }
            },
            {
              "": {
                "and": ["CP3107", "CP3110"]
              }
            },
            "IS4010",
            "TR3203"
          ]
        }
      },
      {
        "cs_breadth_and_depth": {
          "tag": "B&D",
          "state": "overallDegreeState",
          "at_least_n_mcs": 24,
          "and": [
            {
              "1": {
                "state": "csBreadthAndDepthState",
                "or": [
                  {
                    "swe_focus_area_primaries": {
                      "at_least_n_modules": 3,
                      "tag": "swe",
                      "and": [
                        {
                          "SWE FA at least 1 Level 4000": {
                            "state": "csSWEFABasketState",
                            "at_least_n_of": {
                              "n": 1,
                              "baskets": ["CS4211", "CS4218", "CS4239"]
                            }
                          }
                        },
                        {
                          "SWE FA at least 2 others": {
                            "state": "csSWEFABasketState",
                            "at_least_n_of": {
                              "n": 2,
                              "baskets": [
                                {
                                  "CS2103T": {
                                    "module": {
                                      "code": "CS2103T",
                                      "double_count": true
                                    }
                                  }
                                },
                                "CS3213",
                                "CS3219",
                                "CS4211",
                                "CS4218",
                                "CS4239"
                              ]
                            }
                          }
                        }
                      ]
                    }
                  },
                  {
                    "algo_focus_area_primaries": {
                      "tag": "algo",
                      "at_least_n_of": {
                        "n": 2,
                        "baskets": [
                          {
                            "Level 4000": {
                              "state": "csAlgosFABasketState",
                              "at_least_n_of": {
                                "n": 1,
                                "baskets": ["CS4231", "CS4232", "CS4234"]
                              }
                            }
                          },
                          {
                            "": {
                              "state": "csAlgosFABasketState",
                              "at_least_n_of": {
                                "n": 2,
                                "baskets": [
                                  "CS3230",
                                  "CS3231",
                                  "CS3236",
                                  "CS4231",
                                  "CS4232",
                                  "CS4234"
                                ]
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            },
            {
              "2": {
                "state": "csBreadthAndDepthState",
                "module": {
                  "code_prefix": "CS",
                  "required_mcs": 16,
                  "early_terminate": true
                }
              }
            }
          ]
        }
      },
      {
        "math_and_sci": {
          "state": "overallDegreeState",
          "and": [
            {
              "": { "or": [{ "": { "and": ["ST2131", "ST2132"] } }, "ST2334"] }
            },
            "MA1101R",
            "MA1521",
            {
              "physics": {
                "or": ["PC1221"]
              }
            }
          ]
        }
      },
      {
        "ue": {
          "state": "overallDegreeState",
          "module": {
            "code_pattern": ".",
            "required_mcs": 32,
            "early_terminate": false
          }
        }
      }
    ]
  }
}
`;
export default str;
