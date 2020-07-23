// convert, detect 共通の文字コード値:  
//  - 'UTF32'   (detect only)  
//  - 'UTF16'   (detect only)  
//  - 'BINARY'  (detect only)  
//  - 'ASCII'   (detect only)  
//  - 'JIS'  
//  - 'UTF8'  
//  - 'EUCJP'  
//  - 'SJIS'  
//  - 'UNICODE' (JavaScript Unicode String/Array)  
//  
// ※ (detect only) は Encoding.detect() でのみ有効 (変換はできない)  
// ※ 'UNICODE' は JavaScript の Unicode コード値 (0xFF 以上の数値になりえる)  
//


const app = new Vue({
  el: '#app',
  data() {
    return {
      filedata: {
        name: '',
        size: '',
        type: '',
        last: '',
      },
      dataProperties: [],
      ItemProperties: [],
      dataObject: {},
      itemObject: {},
      heighestVal: 0,
      number: 0,
      itemNum: 0,
      flag: false,
    };
  },
  methods: {
    reset : () => {
      Object.assign(app.$data, app.$options.data());
    },
    getFileData(file){
      this.filedata.name = file.name;
      this.filedata.size = file.size;
      this.filedata.type = file.type;
      this.filedata.last = file.lastModifiedDate;
    },
    inputFile(e){
      let files = e.target.files;
      let file = files[0];
      
      if(file == null) return;
      
      this.reset();
      this.getFileData(file);
      
      let reader = new FileReader();
      reader.readAsBinaryString(file);
      
      if (file.type != 'application/vnd.ms-excel') {
        console.error(`MIME type error occurred reading file: ${file.name}, type: ${file.type}`);
        return;
      };
      
      //reader.onloadstart = (e) => {};
      
      //reader.onprogress = (e) => {};
      
      reader.onload = (e) =>  {
        console.log(`File: ${file.name} read successfully`);
        let result = e.target.result;
        let encord = Encoding.convert(result, 'UNICODE');
        let fileData = encord.split(/,|\n/);
    
        this.dataObject = this.createDataObject(this.createDateArry(fileData));
        this.itemObject = this.createItemsObject(this.createItemArry(fileData));
        this.getDataProperty(this.dataObject);
        this.getItemProperty(this.itemObject);
        
        this.itemNum = Math.round(100 / this.itemNum);
        
        console.log('csvデータ',this.dataObject);
        console.log('item別データ',this.itemObject);
        console.log('最高値', this.heighestVal);
        
        $('#formDataModal').modal('hide');
        this.flag = true;
        return;
      };
      
      reader.onerror = (e) => {
        console.error(`Error occurred reading file: ${file.name}`);
      };
    },
    assessmentHeightest(val){
      if(val > this.heighestVal) this.heighestVal = val;
    },
    calculateItemNum(val){
      if(val > this.itemNum) this.itemNum = val;
    },
    createDataObject(DataArry){
      let DataObject = {};
      let nowProperty;
      let previousProperty;
      let tmp;
      let ratio;
      let count = 1;
      
      for (let i = 1; i < DataArry.length; i++){
        nowProperty = DataArry[i][0];
        ratio = Math.round((DataArry[i][2] / this.heighestVal)*100);
        
        if (nowProperty == previousProperty){
          tmp = [DataArry[i][1],DataArry[i][2],ratio];
          console.log(DataObject[nowProperty]);
          DataObject[nowProperty].push(tmp);
          count++;
        }
        else{
          DataObject[nowProperty] = [];
          tmp = [DataArry[i][1],DataArry[i][2],ratio];
          DataObject[nowProperty].push(tmp);
          count = 1;
        }
        previousProperty = nowProperty;
        this.calculateItemNum(count);
      }
      return DataObject;
    },
    createItemsObject(ItemArry){
      let DataObject = {};
      let nowProperty;
      let tmp;

      for (let i = 1; i < ItemArry.length; i++){
        nowProperty = ItemArry[i][0];
        
        if(DataObject[nowProperty]){
          tmp = [ItemArry[i][1],ItemArry[i][2]];
          DataObject[nowProperty].push(tmp);
        }
        else{
          DataObject[nowProperty] = [];
          tmp = [ItemArry[i][1],ItemArry[i][2]];
          DataObject[nowProperty].push(tmp);
        }
      }
      return DataObject;
    },
    getDataProperty(dataObject){
      let objectArry = Object.keys(dataObject);
      
      for (let i = 0; i < objectArry.length; i++){
        if(objectArry[i] === '') objectArry.splice( i, i );
      }
      this.dataProperties = objectArry;
    },
    getItemProperty(dataObject){
      let objectArry = Object.keys(dataObject);
      
      for (let i = 0; i < objectArry.length; i++){
        if(objectArry[i] === '') objectArry.splice( i, i );
      }
      this.ItemProperties = objectArry;
      this.setItemcolor();
    },
    setItemcolor(){
      this.ItemProperties.forEach((property) => {
        this.itemObject[property]["color"] = this.createItemColor();
      });
    },
    createItemColor(){
      const randomColor = "rgb(" + (~~(256 * Math.random())) + ", " + (~~(256 * Math.random())) + ", " + (~~(256 * Math.random())) + ")" ;
      console.log('color:', randomColor);
      return randomColor;
    },
    createDateArry(data){
      let DateArry = [];
      
      for (let i = 0; i < data.length; i++){
        if (i % 3 === 0) {
          let arry = [data[i],data[i+1],data[i+2]];
          DateArry.push(arry);
          this.assessmentHeightest(data[i+2]);
        }
      }
      return DateArry;
    },
    createItemArry(data){
      let ItemArry = [];
      
      for (let i = 0; i < data.length; i++){
        if (i % 3 === 0) {
          let arry = [data[i+1],data[i],data[i+2]];
          ItemArry.push(arry);
        }
      }
      return ItemArry;
    },
    dispData(e){
      const Property = document.form.Property;
    
    	// 値(数値)を取得
    	const num = Property.selectedIndex;
    
    	// 値(数値)から値(value値)を取得
    	const val = Property.options[num].value;
      alert(val);
      console.log(e);
    },
    previousProperty(){
      if(this.number !== 0) this.number--;
    },
    nextProperty(){
      if(this.number !== (this.dataProperties.length-1)) this.number++;
    },
  },
});