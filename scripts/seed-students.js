require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const axios = require('axios');

const SERVER_URL = process.env.SERVER_URL || 'https://letsbunk-server.azurewebsites.net';

// Raw student data (FirstName MiddleName LastName EnrollmentNo Branch Semester Email)
const rawData = `
Aaryan       Gupta    0246AL241001   AIML   IV   aaryan.al241001@global.org.in
Aastha       Gupta    0246AL241002   AIML   IV   aastha.al241002@global.org.in
Abhay       Tiwari    0246AL241003   AIML   IV   abhay.al241003@global.org.in
Abhi       Patel   0246AL241004   AIML   IV   abhi.al241004@global.org.in
Abhinav      Vishwakarma   0246AL241005   AIML   IV   abhinav.al241005@global.org.in
Adarsh    Kumar    Kourav    0246AL241007   AIML   IV   adarsh.al241007@global.org.in
Aditi   Avadhesh   Namdeo   0246AL241008   AIML   IV   aditi.al241008@global.org.in
Aditi      Jain   0246AL241009   AIML   IV   aditi.al241009@global.org.in
Aditya       Barman   0246AL241010   AIML   IV   aditya.al241010@global.org.in
Aditya      Mehta    0246AL241011   AIML   IV   aditya.al241011@global.org.in
Aditya       Patel   0246AL241012   AIML   IV   aditya.al241012@global.org.in
Aditya       Patel   0246AL241013   AIML   IV   aditya.al241013@global.org.in
Aditya       Swarnkar   0246AL241014   AIML   IV   aditya.al241014@global.org.in
Akshat       Pandey   0246AL241016   AIML   IV   akshat.al241016@global.org.in
Akshat      Shrivastava    0246AL241018   AIML   IV   akshat.al241018@global.org.in
Akshat       Soni   0246AL241019   AIML   IV   akshat.al241019@global.org.in
Aleena   Fatima    Khan   0246AL241020   AIML   IV   aleena.al241020@global.org.in
AMAN      BHUSHAN   0246AL241021   AIML   IV   aman.al241021@global.org.in
Anand      Tiwari   0246AL241023   AIML   IV   anand.al241023@global.org.in
Anant      Choudhary    0246AL241024   AIML   IV   anant.al241024@global.org.in
Aniket    Belwal    Mishra    0246AL241025   AIML   IV   aniket.al241025@global.org.in
Ankita       Kol   0246AL241026   AIML   IV   ankita.al241026@global.org.in
Ankita      Sahu   0246AL241027   AIML   IV   ankita.al241027@global.org.in
Anmol      Bedi   0246AL241028   AIML   IV   anmol.al241028@global.org.in
Anmol       Rawat   0246AL241029   AIML   IV   anmol.al241029@global.org.in
Annika      Kapoor   0246AL241030   AIML   IV   annika.al241030@global.org.in
Anshika       Barmaiya    0246AL241031   AIML   IV   anshika.al241031@global.org.in
Anshika       Sahu   0246AL241032   AIML   IV   anshika.al241032@global.org.in
Anshuman       Gupta    0246AL241033   AIML   IV   anshuman.al241033@global.org.in
Anurag    Kumar    Singh   0246AL241034   AIML   IV   anurag.al241034@global.org.in
Anurag       Vishwakarma    0246AL241035   AIML   IV   anurag.al241035@global.org.in
Anushkha       Yadav    0246AL241036   AIML   IV   anushkha.al241036@global.org.in
Arch      Gupta   0246AL241037   AIML   IV   arch.al241037@global.org.in
ARCHIE       Patel    0246AL241038   AIML   IV   archie.al241038@global.org.in
arman   kumar   patel   0246AL241039   AIML   IV   arman.al241039@global.org.in
Arnav       Shah   0246AL241040   AIML   IV   arnav.al241040@global.org.in
Arohi      Jain   0246AL241041   AIML   IV   arohi.al241041@global.org.in
Arpita      Soni   0246AL241042   AIML   IV   arpita.al241042@global.org.in
Arush    Aaron   Joseph   0246AL241043   AIML   IV   arush.al241043@global.org.in
Ashi       Pandey   0246AL241045   AIML   IV   ashi.al241045@global.org.in
Ashish       Soni    0246AL241047   AIML   IV   ashish.al241047@global.org.in
Ashit      Vishwakarma    0246AL241048   AIML   IV   ashit.al241048@global.org.in
ASHU      CHOURASIA    0246AL241049   AIML   IV   ashu.al241049@global.org.in
Atharav    Rajesh    Pohare    0246AL241050   AIML   IV   atharav.al241050@global.org.in
Avantika      Paroha   0246AL241051   AIML   IV   avantika.al241051@global.org.in
Avika       Vishwakarma   0246AL241052   AIML   IV   avika.al241052@global.org.in
Ayush       Garg   0246AL241053   AIML   IV   ayush.al241053@global.org.in
Ayush      Vishwakarma   0246AL241054   AIML   IV   ayush.al241054@global.org.in
AYUSHI       CHOUKSEY    0246AL241055   AIML   IV   ayushi.al241055@global.org.in
Ayushi       Patel   0246AL241056   AIML   IV   ayushi.al241056@global.org.in
Ayushi      Pawar   0246AL241057   AIML   IV   ayushi.al241057@global.org.in
Bharti Lodhi      Lodhi   0246AL241058   AIML   IV   bharti lodhi.al241058@global.org.in
Bhasit      Gupta    0246AL241059   AIML   IV   bhasit.al241059@global.org.in
BHAVANA       SAHU   0246AL241060   AIML   IV   bhavana.al241060@global.org.in
Bhoomi       Pandey    0246AL241061   AIML   IV   bhoomi.al241061@global.org.in
Chirag       Thakur    0246AL241062   AIML   IV   chirag.al241062@global.org.in
Deeksha       Soni   0246AL241063   AIML   IV   deeksha.al241063@global.org.in
Deepanjali      Pathak    0246AL241065   AIML   IV   deepanjali.al241065@global.org.in
Dhara      Ahirwal   0246AL241067   AIML   IV   dhara.al241067@global.org.in
Dhruv       Vishwakarma    0246AL241068   AIML   IV   dhruv.al241068@global.org.in
Dolly       Rusiya   0246AL241070   AIML   IV   dolly.al241070@global.org.in
Durgesh       Patel   0246AL241071   AIML   IV   durgesh.al241071@global.org.in
Durgeshwari      Sahu   0246AL241072   AIML   IV   durgeshwari.al241072@global.org.in
Eshaan      Sharma   0246AL241073   AIML   IV   eshaan.al241073@global.org.in
Eshant       Singh   0246AL241074   AIML   IV   eshant.al241074@global.org.in
Gargi       Gupta   0246AL241075   AIML   IV   gargi.al241075@global.org.in
HARIOM       TIWARI    0246AL241076   AIML   IV   hariom.al241076@global.org.in
Harsh      Kumar   0246AL241078   AIML   IV   harsh.al241078@global.org.in
Harsh      Mishra   0246AL241079   AIML   IV   harsh.al241079@global.org.in
HARSH      MONGA   0246AL241080   AIML   IV   harsh.al241080@global.org.in
Harsh      Rana   0246AL241081   AIML   IV   harsh.al241081@global.org.in
Harsh       Thakur    0246AL241082   AIML   IV   harsh.al241082@global.org.in
Harsh   Vardhan    Soni    0246AL241083   AIML   IV   harsh.al241083@global.org.in
Himanshu       Haldkar   0246AL241085   AIML   IV   himanshu.al241085@global.org.in
Himanshu       Patel   0246AL241086   AIML   IV   himanshu.al241086@global.org.in
Hitesh      Sen   0246AL241087   AIML   IV   hitesh.al241087@global.org.in
Janhvi      Soni   0246AL241088   AIML   IV   janhvi.al241088@global.org.in
Janhwi      Mudgal   0246AL241089   AIML   IV   janhwi.al241089@global.org.in
Jay      Dubey    0246AL241090   AIML   IV   jay.al241090@global.org.in
Jiya      Sahu   0246AL241092   AIML   IV   jiya.al241092@global.org.in
Junaid       Khan    0246AL241093   AIML   IV   junaid.al241093@global.org.in
Kartik       Jain   0246AL241094   AIML   IV   kartik.al241094@global.org.in
Kartikey       Mourya   0246AL241095   AIML   IV   kartikey.al241095@global.org.in
Khushboo      Koshta   0246AL241096   AIML   IV   khushboo.al241096@global.org.in
Kishan       Kumar   0246AL241097   AIML   IV   kishan.al241097@global.org.in
Kishan       Namdev   0246AL241098   AIML   IV   kishan.al241098@global.org.in
Komal      Kamal   0246AL241099   AIML   IV   komal.al241099@global.org.in
Krishna      Mishra   0246AL241101   AIML   IV   krishna.al241101@global.org.in
Kunal      Nishad   0246AL241102   AIML   IV   kunal.al241102@global.org.in
Lucky      Foujdar   0246AL241103   AIML   IV   lucky.al241103@global.org.in
Manas       Vajpayee    0246AL241104   AIML   IV   manas.al241104@global.org.in
Manpreet    Singh   Nag   0246AL241105   AIML   IV   manpreet.al241105@global.org.in
Mansi      Gupta    0246AL241106   AIML   IV   mansi.al241106@global.org.in
Mayank    Kumar    Dubey    0246AL241108   AIML   IV   mayank.al241108@global.org.in
Mayank      Radke   0246AL241110   AIML   IV   mayank.al241110@global.org.in
MD Shahid   Husain    Behana    0246AL241111   AIML   IV   md shahid.al241111@global.org.in
Misthy      Koshta   0246AL241112   AIML   IV   misthy.al241112@global.org.in
Mohammad Jasim       Shaikh   0246AL241113   AIML   IV   mohammad jasim.al241113@global.org.in
Mohit       Dubey   0246AL241114   AIML   IV   mohit.al241114@global.org.in
Moon       Karmakar    0246AL241115   AIML   IV   moon.al241115@global.org.in
Mudit       Singh    0246AL241116   AIML   IV   mudit.al241116@global.org.in
Nandani   Singh   Thakur   0246AL241117   AIML   IV   nandani.al241117@global.org.in
Nevit       Parjapat    0246AL241118   AIML   IV   nevit.al241118@global.org.in
Om      Pandey    0246AL241121   AIML   IV   om.al241121@global.org.in
Palak      Patel   0246AL241122   AIML   IV   palak.al241122@global.org.in
Palak       Soni   0246AL241123   AIML   IV   palak.al241123@global.org.in
Palak      Vishwakarma   0246AL241124   AIML   IV   palak.al241124@global.org.in
Pari       Jain   0246AL241125   AIML   IV   pari.al241125@global.org.in
Parvati      Choudhary   0246AL241126   AIML   IV   parvati.al241126@global.org.in
Pavani      Karemore    0246AL241127   AIML   IV   pavani.al241127@global.org.in
Payal      Rajak   0246AL241128   AIML   IV   payal.al241128@global.org.in
Piyush       Dubey   0246AL241130   AIML   IV   piyush.al241130@global.org.in
Piyush       Thakur    0246AL241131   AIML   IV   piyush.al241131@global.org.in
Pooja       Sahu   0246AL241132   AIML   IV   pooja.al241132@global.org.in
Pranjal       Jayswal   0246AL241133   AIML   IV   pranjal.al241133@global.org.in
Pranjal      Singh   0246AL241134   AIML   IV   pranjal.al241134@global.org.in
Prasiddhima       Raikwar    0246AL241136   AIML   IV   prasiddhima.al241136@global.org.in
Prithvi       Patel   0246AL241137   AIML   IV   prithvi.al241137@global.org.in
Priyanshi       Thakur    0246AL241138   AIML   IV   priyanshi.al241138@global.org.in
Radhika       Mishra   0246AL241142   AIML   IV   radhika.al241142@global.org.in
Reema       Patel    0246AL241144   AIML   IV   reema.al241144@global.org.in
Rishabh      Kori   0246AL241146   AIML   IV   rishabh.al241146@global.org.in
Ritesh       Patel   0246AL241148   AIML   IV   ritesh.al241148@global.org.in
Riya      Choudhary   0246AL241149   AIML   IV   riya.al241149@global.org.in
Sachin      Jain   0246AL241153   AIML   IV   sachin.al241153@global.org.in
Sagar      Patel   0246AL241154   AIML   IV   sagar.al241154@global.org.in
Sagar       Patel    0246AL241155   AIML   IV   sagar.al241155@global.org.in
Sahil      Yadav    0246AL241158   AIML   IV   sahil.al241158@global.org.in
Sakshi      Dubey   0246AL241160   AIML   IV   sakshi.al241160@global.org.in
Samaira      Lal   0246AL241161   AIML   IV   samaira.al241161@global.org.in
Samarth      Prajapati    0246AL241162   AIML   IV   samarth.al241162@global.org.in
Sampda       Shukla    0246AL241163   AIML   IV   sampda.al241163@global.org.in
Saniya       Nema   0246AL241164   AIML   IV   saniya.al241164@global.org.in
Sanjana       Vishwakarma   0246AL241165   AIML   IV   sanjana.al241165@global.org.in
Sanskar       Kaurav   0246AL241166   AIML   IV   sanskar.al241166@global.org.in
Satvik       Sharma   0246AL241168   AIML   IV   satvik.al241168@global.org.in
Satyam      Shrivastava   0246AL241169   AIML   IV   satyam.al241169@global.org.in
Satyam      Shrivastava    0246AL241170   AIML   IV   satyam.al241170@global.org.in
Sehwag       Yadav    0246AL241171   AIML   IV   sehwag.al241171@global.org.in
Shaynee       Soni   0246AL241172   AIML   IV   shaynee.al241172@global.org.in
Shivam       Jyotishi   0246AL241173   AIML   IV   shivam.al241173@global.org.in
Shivam      Kushwaha   0246AL241174   AIML   IV   shivam.al241174@global.org.in
Shivank      Jaiswal   0246AL241177   AIML   IV   shivank.al241177@global.org.in
Shivansh      Yadav    0246AL241178   AIML   IV   shivansh.al241178@global.org.in
Shaurya      Singhai   0246AL241180   AIML   IV   shaurya.al241180@global.org.in
Shraddha       Namdeo    0246AL241181   AIML   IV   shraddha.al241181@global.org.in
Shrajal       Sahu   0246AL241182   AIML   IV   shrajal.al241182@global.org.in
Shreya      Goswami   0246AL241183   AIML   IV   shreya.al241183@global.org.in
Shreya      Goutam   0246AL241184   AIML   IV   shreya.al241184@global.org.in
Shreya       Mishra    0246AL241185   AIML   IV   shreya.al241185@global.org.in
Shreya   Patel    Kachhi   0246AL241186   AIML   IV   shreya.al241186@global.org.in
Shreya      Vishwakarma    0246AL241187   AIML   IV   shreya.al241187@global.org.in
SHREYANSH       AWADHIYA    0246AL241188   AIML   IV   shreyansh.al241188@global.org.in
Shreyansh      Vishwakarma    0246AL241189   AIML   IV   shreyansh.al241189@global.org.in
Shubh       Umre   0246AL241191   AIML   IV   shubh.al241191@global.org.in
Shwetank       Badgaiya    0246AL241193   AIML   IV   shwetank.al241193@global.org.in
Siddharth       Sen   0246AL241194   AIML   IV   siddharth.al241194@global.org.in
Siddharth       Vishwakarma    0246AL241195   AIML   IV   siddharth.al241195@global.org.in
Siddharth       Yadav   0246AL241196   AIML   IV   siddharth.al241196@global.org.in
Sneha      Saini   0246AL241197   AIML   IV   sneha.al241197@global.org.in
Sonali      Namdeo    0246AL241198   AIML   IV   sonali.al241198@global.org.in
Sourabh       Barman   0246AL241199   AIML   IV   sourabh.al241199@global.org.in
Srajal    *   Tiwari    0246AL241201   AIML   IV   srajal.al241201@global.org.in
Srishti       Shrivastava    0246AL241202   AIML   IV   srishti.al241202@global.org.in
Sudhanshu      Patel   0246AL241203   AIML   IV   sudhanshu.al241203@global.org.in
Swapnil       Pandey   0246AL241204   AIML   IV   swapnil.al241204@global.org.in
Swati       Sahu   0246AL241206   AIML   IV   swati.al241206@global.org.in
Tamanna      Bhatia   0246AL241208   AIML   IV   tamanna.al241208@global.org.in
Tanishk       Sahu   0246AL241209   AIML   IV   tanishk.al241209@global.org.in
Tanishka      Soni   0246AL241210   AIML   IV   tanishka.al241210@global.org.in
Tanu       Mourya   0246AL241211   AIML   IV   tanu.al241211@global.org.in
Tanu      Vishwakarma    0246AL241212   AIML   IV   tanu.al241212@global.org.in
Trapti      Vishwakarma   0246AL241213   AIML   IV   trapti.al241213@global.org.in
Utkarsh      Tripathi   0246AL241217   AIML   IV   utkarsh.al241217@global.org.in
Vaishnavi       Singh   0246AL241218   AIML   IV   vaishnavi.al241218@global.org.in
Vedanshi      Yadav   0246AL241220   AIML   IV   vedanshi.al241220@global.org.in
Veena      Tripathi   0246AL241221   AIML   IV   veena.al241221@global.org.in
Vibhuti       Singh    0246AL241222   AIML   IV   vibhuti.al241222@global.org.in
Vidhi      Singh   0246AL241223   AIML   IV   vidhi.al241223@global.org.in
Viraj   Kumar   Vishwakarma    0246AL241225   AIML   IV   viraj.al241225@global.org.in
Vishakha       Lodhi    0246AL241226   AIML   IV   vishakha.al241226@global.org.in
Vivek       Pandey    0246AL241227   AIML   IV   vivek.al241227@global.org.in
Vivek      Tripathi   0246AL241228   AIML   IV   vivek.al241228@global.org.in
Yash      Chanpuriya    0246AL241229   AIML   IV   yash.al241229@global.org.in
Yash    Kumar   Gupta    0246AL241231   AIML   IV   yash.al241231@global.org.in
Yash       Patel   0246AL241232   AIML   IV   yash.al241232@global.org.in
Yashvi      Singh    0246AL241234   AIML   IV   yashvi.al241234@global.org.in
`.trim();

// Branch mapping (case-sensitive from API)
const branchMap = {
  'AIML': 'AiMl',
  'CSE': 'Computer Science',
  'CS (CC)': 'cloud',
  'CS   (CC)': 'cloud'
};

// Parse raw data
function parseStudents(raw) {
  const lines = raw.split('\n').filter(l => l.trim());
  const students = [];
  
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 6) continue;
    
    const email = parts[parts.length - 1];
    const semester = parts[parts.length - 2]; // IV
    const branch = parts[parts.length - 3]; // AIML, CSE, CS, (CC)
    const enrollmentNo = parts[parts.length - 4];
    
    // Handle "CS (CC)" case
    let actualBranch = branch;
    if (branch === 'CS' && parts[parts.length - 3] === '(CC)') {
      actualBranch = 'CS (CC)';
    }
    
    // Get name (everything before enrollmentNo)
    const nameEndIdx = parts.indexOf(enrollmentNo);
    const nameParts = parts.slice(0, nameEndIdx).filter(p => p !== '*');
    const fullName = nameParts.join(' ');
    
    // Extract first name for password
    const firstName = nameParts[0].toLowerCase();
    
    students.push({
      enrollmentNo,
      name: fullName,
      email,
      password: enrollmentNo, // Use enrollment number as password (case-sensitive)
      branch: branchMap[actualBranch] || actualBranch,
      semester: semester === 'IV' ? '4' : semester,
      dob: '2000-01-01', // Placeholder
      phone: '',
      isActive: true
    });
  }
  
  return students;
}

async function seedStudents() {
  try {
    console.log(`🌱 Seeding students to ${SERVER_URL}...`);
    
    const students = parseStudents(rawData);
    console.log(`📊 Parsed ${students.length} students`);
    
    // Show first student as sample
    console.log('\n📝 Sample student:');
    console.log(JSON.stringify(students[0], null, 2));
    
    // Bulk insert
    const response = await axios.post(`${SERVER_URL}/api/students/bulk`, {
      students
    });
    
    if (response.data.success) {
      console.log(`\n✅ Successfully seeded ${response.data.count} students`);
    } else {
      console.error('❌ Seed failed:', response.data.error);
    }
  } catch (error) {
    if (error.response) {
      console.error('❌ Server error:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

seedStudents();
