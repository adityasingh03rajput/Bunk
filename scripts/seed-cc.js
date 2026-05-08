const axios = require('axios');
const SERVER = 'https://letsbunk-server.azurewebsites.net';
function s(name,no,email){return{enrollmentNo:no,name,email,password:no,branch:'cloud',semester:'4',dob:'2000-01-01',phone:'',isActive:true};}
const students=[
  s('Abhishek Gupta','0246CC241001','abhishek.cc241001@global.org.in'),
  s('Abhishek Raj','0246CC241002','abhishek.cc241002@global.org.in'),
  s('Abhishek Vishwakarma','0246CC241003','abhishek.cc241003@global.org.in'),
  s('Aditya Raj','0246CC241004','aditya.cc241004@global.org.in'),
  s('Alok Kumar Yadav','0246CC241005','alok.cc241005@global.org.in'),
  s('Ankit Rajak','0246CC241007','ankit.cc241007@global.org.in'),
  s('ARPIT PATEL','0246CC241009','arpit.cc241009@global.org.in'),
  s('Aryan Rajak','0246CC241010','aryan.cc241010@global.org.in'),
  s('Devansh Kushwaha','0246CC241011','devansh.cc241011@global.org.in'),
  s('Dipak Saket','0246CC241012','dipak.cc241012@global.org.in'),
  s('Hemant Sahu','0246CC241015','hemant.cc241015@global.org.in'),
  s('Himansh Sharma','0246CC241016','himansh.cc241016@global.org.in'),
  s('Lucky Patel','0246CC241020','lucky.cc241020@global.org.in'),
  s('Mohammad Saif','0246CC241022','mohammad.cc241022@global.org.in'),
  s('prince singh','0246CC241025','prince.cc241025@global.org.in'),
  s('Priyanshu Kushwaha','0246CC241027','priyanshu.cc241027@global.org.in'),
  s('Rahul Prajapati','0246CC241028','rahul.cc241028@global.org.in'),
  s('Rittik Kumar Jha','0246CC241029','rittik.cc241029@global.org.in'),
  s('Suman Vishwakarma','0246CC241031','suman.cc241031@global.org.in'),
  s('Vinay Kumar Mishra','0246CC241033','vinay.cc241033@global.org.in'),
  s('Vishmal Patel','0246CC241034','vishmal.cc241034@global.org.in'),
  s('Yash Mishra','0246CC241035','yash.cc241035@global.org.in'),
  s('Yuvraj Vishwakrma','0246CC241037','yuvraj.cc241037@global.org.in'),
];
async function seed(){
  let ins=0,skip=0,fail=0;
  for(const st of students){
    try{await axios.post(SERVER+'/api/students',st);console.log('✅ '+st.enrollmentNo+' '+st.name);ins++;}
    catch(e){const m=e.response?.data?.error||e.message||'';if(m.includes('E11000')||m.includes('duplicate')){console.log('⏭️  SKIP '+st.enrollmentNo);skip++;}else{console.error('❌ '+st.enrollmentNo+': '+m);fail++;}}
  }
  console.log('\n📊 CC done — inserted:'+ins+' skipped:'+skip+' failed:'+fail);
}
seed();
