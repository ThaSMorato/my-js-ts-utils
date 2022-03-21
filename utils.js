//import moment from 'moment';

const moment = require('moment');



class Utils{

    params = [];

    file;

    
    imageMime = ['89504e47','47494638','ffd8ffe0','ffd8ffe1','ffd8ffe2','ffd8ffe3','ffd8ffe8','ffd8ffee'];

    certifiedMime = ['3082f33'];

    zipAndRarMime = ['504b34', '504b56', '504b78', '52617221']

    fdbMime = ['103930']
    
  onlyNumbers(value){
    const reg = /[0123456789]/g
    let code = value.match(reg);
    let ret = '';
    code?.map(el => ret = ret + el)
    return ret;
  }


  checkFdbExtension(fileName){
    let ret = false;
    if(fileName.split('.').slice(-1)[0].toLowerCase() === 'fdb') ret = true;
    return ret;
  }

  validateEmail(email) {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  
  toBase64(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let temp = reader.result?.toString();
        let ret = temp.slice(temp.indexOf('64,')+3)
        resolve(ret)
      }
      reader.onerror = error => reject(error);
    });
  }

  checkIfIsImage(file){
    return new Promise((resolve, reject) => {
      this.getFileMime(file).then(
        mime => {
          if(this.imageMime.includes(mime)) resolve({image:true, mime});
          resolve({image:false, mime})
        }
      ).catch(err => reject(err))
    });
  }

  checkIfIsPFX(file){
    return new Promise((resolve, reject) => {
      this.getFileMime(file).then(
        mime => {
          if(this.certifiedMime.includes(mime)) resolve({pfx:true, mime});
          resolve({pfx:false, mime})
        }
      ).catch(err => reject(err))
    });
  }

  checkIfIsCompactFile(file){
    return new Promise((resolve, reject) => {
      this.getFileMime(file).then(
        mime => {
          if(this.zipAndRarMime.includes(mime)) resolve({compacted:true, mime});
          resolve({compacted:false, mime})
        }
      ).catch(err => reject(err))
    });
  }

  uploadCampactFile(file){
    return new Promise( async (resolve, reject)=>{
      let {compacted, mime} = await this.checkIfIsCompactFile(file);
      if(compacted) resolve(this.toBase64(file))
      else reject({mime, error:'Documento não identificado como Arquivo compactado (zip, rar)'});
    })
  }


  checkIfIsFdb(file){
    return new Promise((resolve, reject) => {
      this.getFileMime(file).then(
        mime => {
          if(this.fdbMime.includes(mime) && this.checkFdbExtension(file.name)) resolve({compacted:true, mime});
          resolve({compacted:false, mime})
        }
      ).catch(err => reject(err))
    });
  }

  uploadFdbFile(file){
    return new Promise( async (resolve, reject)=>{
      let {compacted, mime} = await this.checkIfIsFdb(file);
      if(compacted) resolve(this.toBase64(file))
      else reject({mime, error:'Documento não identificado como Banco de dados Firebird (.fdb)'});
    })
  }

  getFileMime(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file.slice(0,4));
      reader.onloadend = (e) => {
        let arr = (new Uint8Array(e.target?.result)).subarray(0, 4)
        let mime = "";
        for(var i = 0; i < arr.length; i++) {
          mime += arr[i].toString(16);
       }
        resolve(mime)
      }
      reader.onerror = error => reject(error);
    })
  }

  strCapitalize(text){
    let ret = text.toLowerCase();
    return ret.charAt(0).toUpperCase() + ret.slice(1);
  }

  uploadCertifiedFile(file){
    return new Promise( async (resolve, reject)=>{
      let {pfx, mime} = await this.checkIfIsPFX(file);
      if(pfx) resolve(this.toBase64(file))
      else reject({mime, error:'Documento não identificado como certificado'});
    })
  }

  uploadImageFile(file){
    return new Promise( async (resolve, reject)=>{
      let {image, mime} = await this.checkIfIsImage(file);
      if(image) resolve(this.toBase64(file))

      else reject({mime, error:'Documento não identificado como Imagem'});
    })
  }

    
    formatDate(date = null, format_from = 'DD/MM/YYYY', format_to = 'YYYY-MM-DD') {
        moment.locale('pt-br');
        if(!date) {
            let aux = new Date()
            date = `${aux.getFullYear()}-${(+aux.getMonth() + 1)}-${aux.getDate()} ${aux.getHours()}:${aux.getMinutes()}:${aux.getSeconds()}`;
            return format_to == 'toDate' ? moment(date, 'YYYY-M-D H:m:s').toDate() : moment(date, 'YYYY-MM-DDTHH:mm:ss').format(format_to)
        }
        else
            return format_to == 'toDate' ? moment(date, format_from).toDate() : moment(date, format_from).format(format_to)
    }

    randomString(length = 5) {
        return new Promise((resolve, reject) => {
            let result           = '';
            let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            for (let i = 0; i < length; i++)
                result += characters.charAt(Math.floor(Math.random() * charactersLength));

            setTimeout(() => resolve(result), 200)
        })
    }

    order(array, param) {
        return array.sort((a, b) => {
            if(a[param] < b[param]) return -1;
            else if(a[param] > b[param]) return 1;
            else return 0;
        });
    }


    setData(index, data) {
        this.params[index] = data;
    }

    getData(index) {

        return this.params[index];
    }

    noSpecialChars(string) {
        if(!string) return "";
        let translate = {à: 'a', á: 'a', â: 'a', ã: 'a', ä: 'a', å: 'a', æ: 'a', ç: 'c', è: 'e', é: 'e', ê: 'e', ë: 'e', ì: 'i', í: 'i', î: 'i', ï: 'i', ð: 'd', ñ: 'n', ò: 'o', ó: 'o', ô: 'o', õ: 'o', ö: 'o', ø: 'o', ù: 'u', ú: 'u', û: 'u', ü: 'u', ý: 'y', þ: 'b', ÿ: 'y', ŕ: 'r', À: 'A', Á: 'A', Â: 'A', Ã: 'A', Ä: 'A', Å: 'A', Æ: 'A', Ç: 'C', È: 'E', É: 'E', Ê: 'E', Ë: 'E', Ì: 'I', Í: 'I', Î: 'I', Ï: 'I', Ð: 'D', Ñ: 'N', Ò: 'O', Ó: 'O', Ô: 'O', Õ: 'O', Ö: 'O', Ø: 'O', Ù: 'U', Ú: 'U', Û: 'U', Ü: 'U', Ý: 'Y', Þ: 'B', Ÿ: 'Y', Ŕ: 'R',}
        let translate_re = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþßàáâãäåæçèéêëìíîïðñòóôõöøùúûýýþÿŕŕÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÝÝÞŸŔŔ]/gim;
        return string.replace(translate_re, (match) => translate[match]);
    }

    
    manipulateDate(quantity = 1, date = null, format = 'YYYY-MM-DD', key = 'days', operation = 'add') {
        moment.locale('pt-br');

        if(operation == 'add') {
            return date ?
                moment(date).add(quantity, key).format(format) :
                moment().add(quantity, key).format(format)
        }
        else {
            return date ?
                moment(date).subtract(quantity, 'days').format('YYYY-MM-DD') :
                moment().subtract(quantity, 'days').format('YYYY-MM-DD')
        }
    }

    generatePaginate(page, last_page) {
        return new Promise((resolve, reject) => {
            let flag = true;
            let seq = page;
            let sequence = [];

            if(page > 1 && page != last_page) {
                sequence.push(page - 1);
                sequence.push(page);
            }
            else if(page > 2 && page == last_page) {
                sequence.push(page - 2);
                sequence.push(page - 1);
                sequence.push(page);
            }
            else sequence.push(page);

            if(page != last_page) {
                while(flag) {
                    if(sequence.length < 3) {
                        if(seq > last_page) flag = false;
                        else {
                            seq++;
                            sequence.push(seq);
                        }
                    }
                    else flag = false;
                }
            }

            setTimeout(() => resolve(sequence), 500);
        })
    }

    errorMessage(err, message = 'Houve um erro ao realizar a ação') {
        if(err.status == 422)
            return err.error.errors;
        else if(err.status != 422)
            return err.error.error;
        else
            return message;
    }

    formatValue(value = null, size = 2, subs = ['.', ',']) {

        if(subs[0] == '.')
            return value ? (parseFloat(value).toFixed(2)).replace(subs[0], subs[1]) : value;
        else
            return value ? parseFloat(value.replace(subs[0], subs[1])).toFixed(size) : value;
    }

    cloneObject(obj) {
        return Object.assign({}, obj);
    }

    removeSpecialChars(string) {
        return string.replace(/[^\w\s]/gi, '');
    }

    diffDates(first_date = null, second_date = null, type="days") {
        if(!second_date) return null;
        else if(!first_date)
            return moment().diff(second_date, 'days');
        else
            return moment(first_date, 'YYYY-MM-DD').diff(second_date, type);
    }
    
    getFormattedTimeFromDate(date) {
        return new Intl.DateTimeFormat('pt-BR', {hour: 'numeric', minute: 'numeric', second: 'numeric',}).format(date);
    }
}

//export default Utils;

module.exports = Utils;
