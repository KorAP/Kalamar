define(['util'],function () {
  /*
   * Created with http://tools.medialab.sciences-po.fr/iwanthue/
   * and H: 0-360, C: 0.4-2.1, L: 0.7-1.5, 64 colors
   */
  var palette = [
    '9C8AC7',
    '6DED31',
    'DF7F23',
    '5AECD1',
    'F54597',
    'D4D275',
    'E6A8A1',
    '67E682',
    '719A93',
    'E67AE6',
    'E8F03F',
    'F45042',
    '6D9C25',
    'D0C3D9',
    'E37076',
    '509A58',
    'BE9962',
    'D88AB6',
    '71ABCE',
    '62DCEB',
    'D4B73C',
    'A0E5B0',
    '5BBB26',
    'A7E230',
    '7E8EEA',
    'D1856B',
    '59E9A9',
    'F24A61',
    'A6D455',
    'AEE38B',
    '4DA385',
    '999C46',
    'AFDDDE',
    'BA85E0',
    'B68C31',
    '8AA46C',
    'D9874C',
    'A18EA8',
    'E56BAC',
    'ECA72F',
    '3AE152',
    '5B9EDF',
    'E9672F',
    '43B046',
    'E96D59',
    'D6B3E6',
    'E6BB6A',
    '92C5A9',
    'BE7C85',
    '9C9B1E',
    'CCD896',
    '84E861',
    'DA7093',
    'DDEA6F',
    'BCC92E',
    '59C9BD',
    '52A8B0',
    '51BC7C',
    '7EB051',
    'F0D036',
    'D970C5',
    'E95F7D',
    'EF9798',
    'ED5490'
  ];

  KorAP.Palette = {
    getC : function (index) {
      return '#' + palette[index % 64];
    }
  };

  return KorAP.Palette;
});
