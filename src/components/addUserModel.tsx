import images from "../constants/images";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../utils/mutations/users";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: "buyer" | "seller";
}

// Mapping of Nigerian States to their Local Government Areas
const STATE_TO_LGAS: Record<string, string[]> = {
  "Abia": [
    "Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North", 
    "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma", "Ugwunagbo", 
    "Ukwa East", "Ukwa West", "Umuahia North", "Umuahia South", "Umu Nneochi"
  ],
  "Adamawa": [
    "Demsa", "Fufure", "Ganye", "Gayuk", "Gombi", "Grie", "Hong", "Jada", "Lamurde", 
    "Madagali", "Maiha", "Mayo Belwa", "Michika", "Mubi North", "Mubi South", "Numan", 
    "Shelleng", "Song", "Toungo", "Yola North", "Yola South"
  ],
  "Akwa Ibom": [
    "Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", "Etim Ekpo", "Etinan", 
    "Ibeno", "Ibesikpo Asutan", "Ibiono-Ibom", "Ika", "Ikono", "Ikot Abasi", "Ikot Ekpene", 
    "Ini", "Itu", "Mbo", "Mkpat-Enin", "Nsit-Atai", "Nsit-Ibom", "Nsit-Ubium", "Obot Akara", 
    "Okobo", "Onna", "Oron", "Oruk Anam", "Udung-Uko", "Ukanafun", "Uruan", "Urue-Offong/Oruko", 
    "Uyo"
  ],
  "Anambra": [
    "Aguata", "Anambra East", "Anambra West", "Anaocha", "Awka North", "Awka South", 
    "Ayamelum", "Dunukofia", "Ekwusigo", "Idemili North", "Idemili South", "Ihiala", 
    "Njikoka", "Nnewi North", "Nnewi South", "Ogbaru", "Onitsha North", "Onitsha South", 
    "Orumba North", "Orumba South", "Oyi"
  ],
  "Bauchi": [
    "Alkaleri", "Bauchi", "Bogoro", "Damban", "Darazo", "Dass", "Gamawa", "Ganjuwa", 
    "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Kirfi", "Misau", "Ningi", "Shira", 
    "Tafawa Balewa", "Toro", "Warji", "Zaki"
  ],
  "Bayelsa": [
    "Brass", "Ekeremor", "Kolokuma/Opokuma", "Nembe", "Ogbia", "Sagbama", "Southern Ijaw", 
    "Yenagoa"
  ],
  "Benue": [
    "Ado", "Agatu", "Apa", "Buruku", "Gboko", "Guma", "Gwer East", "Gwer West", "Katsina-Ala", 
    "Konshisha", "Kwande", "Logo", "Makurdi", "Obi", "Ogbadibo", "Ohimini", "Oju", "Okpokwu", 
    "Orukpo", "Otukpo", "Tarka", "Ukum", "Ushongo", "Vandeikya"
  ],
  "Borno": [
    "Abadam", "Askira/Uba", "Bama", "Bayo", "Biu", "Chibok", "Damboa", "Dikwa", "Gubio", 
    "Guzamala", "Gwoza", "Hawul", "Jere", "Kaga", "Kala/Balge", "Konduga", "Kukawa", 
    "Kwaya Kusar", "Mafa", "Magumeri", "Maiduguri", "Marte", "Mobbar", "Monguno", "Ngala", 
    "Nganzai", "Shani"
  ],
  "Cross River": [
    "Abi", "Akpabuyo", "Akwa", "Bakassi", "Bekwarra", "Biase", "Boki", "Calabar Municipal", 
    "Calabar South", "Etung", "Ikom", "Obanliku", "Obubra", "Obudu", "Odukpani", "Ogoja", 
    "Yakuur", "Yala"
  ],
  "Delta": [
    "Aniocha North", "Aniocha South", "Bomadi", "Burutu", "Ethiope East", "Ethiope West", 
    "Ika North East", "Ika South", "Isoko North", "Isoko South", "Ndokwa East", "Ndokwa West", 
    "Okpe", "Oshimili North", "Oshimili South", "Patani", "Sapele", "Udu", "Ughelli North", 
    "Ughelli South", "Ukwuani", "Uvwie", "Warri North", "Warri South", "Warri South West"
  ],
  "Ebonyi": [
    "Abakaliki", "Afikpo North", "Afikpo South", "Ebonyi", "Ezza North", "Ezza South", 
    "Ikwo", "Ishielu", "Ivo", "Izzi", "Ohaozara", "Ohaukwu", "Onicha"
  ],
  "Edo": [
    "Akoko-Edo", "Egor", "Esan Central", "Esan North-East", "Esan South-East", "Esan West", 
    "Etsako Central", "Etsako East", "Etsako West", "Igueben", "Ikpoba Okha", "Oredo", 
    "Orhionmwon", "Ovia North-East", "Ovia South-West", "Owan East", "Owan West", "Uhunmwonde"
  ],
  "Ekiti": [
    "Ado Ekiti", "Efon", "Ekiti East", "Ekiti South-West", "Ekiti West", "Emure", "Gbonyin", 
    "Ido Osi", "Ijero", "Ikere", "Ikole", "Ilejemeje", "Irepodun/Ifelodun", "Ise/Orun", 
    "Moba", "Oye"
  ],
  "Enugu": [
    "Aninri", "Awgu", "Enugu East", "Enugu North", "Enugu South", "Ezeagu", "Igbo Etiti", 
    "Igbo Eze North", "Igbo Eze South", "Isi Uzo", "Nkanu East", "Nkanu West", "Nsukka", 
    "Oji River", "Udenu", "Udi", "Uzo Uwani"
  ],
  "Gombe": [
    "Akko", "Balanga", "Billiri", "Dukku", "Funakaye", "Gombe", "Kaltungo", "Kwami", 
    "Nafada", "Shongom", "Yamaltu/Deba"
  ],
  "Imo": [
    "Aboh Mbaise", "Ahiazu Mbaise", "Ehime Mbano", "Ezinihitte", "Ideato North", "Ideato South", 
    "Ihitte/Uboma", "Ikeduru", "Isiala Mbano", "Isu", "Mbaitoli", "Ngor Okpala", "Njaba", 
    "Nkwerre", "Nwangele", "Obowo", "Oguta", "Ohaji/Egbema", "Okigwe", "Orlu", "Orsu", 
    "Oru East", "Oru West", "Owerri Municipal", "Owerri North", "Owerri West", "Unuimo"
  ],
  "Jigawa": [
    "Auyo", "Babura", "Biriniwa", "Birnin Kudu", "Buji", "Dutse", "Gagarawa", "Garki", 
    "Gumel", "Guri", "Gwaram", "Gwiwa", "Hadejia", "Jahun", "Kafin Hausa", "Kazaure", 
    "Kiri Kasama", "Kiyawa", "Kaugama", "Maigatari", "Malam Madori", "Miga", "Ringim", 
    "Roni", "Sule Tankarkar", "Taura", "Yankwashi"
  ],
  "Kaduna": [
    "Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Jema'a", "Kachia", "Kaduna North", 
    "Kaduna South", "Kagarko", "Kajuru", "Kaura", "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", 
    "Sabon Gari", "Sanga", "Soba", "Zangon Kataf", "Zaria"
  ],
  "Kano": [
    "Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure", "Dala", "Dambatta", "Dawakin Kudu", 
    "Dawakin Tofa", "Doguwa", "Fagge", "Gabasawa", "Garko", "Garun Mallam", "Gaya", "Gezawa", 
    "Gwale", "Gwarzo", "Kabo", "Kano Municipal", "Karaye", "Kibiya", "Kiru", "Kumbotso", 
    "Kunchi", "Kura", "Madobi", "Makoda", "Minjibir", "Nasarawa", "Rano", "Rimin Gado", 
    "Rogo", "Shanono", "Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada", 
    "Ungogo", "Warawa", "Wudil"
  ],
  "Katsina": [
    "Bakori", "Batagarawa", "Batsari", "Baure", "Bindawa", "Charanchi", "Dandume", "Danja", 
    "Dan Musa", "Daura", "Dutsi", "Dutsin Ma", "Faskari", "Funtua", "Ingawa", "Jibia", 
    "Kafur", "Kaita", "Kankara", "Kankia", "Katsina", "Kurfi", "Kusada", "Mai'Adua", 
    "Malumfashi", "Mani", "Mashi", "Matazu", "Musawa", "Rimi", "Sabuwa", "Safana", "Sandamu", 
    "Zango"
  ],
  "Kebbi": [
    "Aleiro", "Arewa Dandi", "Argungu", "Augie", "Bagudo", "Bunza", "Dandi", "Fakai", 
    "Gwandu", "Jega", "Kalgo", "Koko/Besse", "Maiyama", "Ngaski", "Sakaba", "Shanga", 
    "Suru", "Wasagu/Danko", "Yauri", "Zuru"
  ],
  "Kogi": [
    "Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", "Igalamela Odolu", 
    "Ijumu", "Kabba/Bunu", "Kogi", "Lokoja", "Mopa Muro", "Ofu", "Ogori/Magongo", "Okehi", 
    "Okene", "Olamaboro", "Omala", "Yagba East", "Yagba West"
  ],
  "Kwara": [
    "Asa", "Baruten", "Edu", "Ekiti", "Ifelodun", "Ilorin East", "Ilorin South", "Ilorin West", 
    "Irepodun", "Isin", "Kaiama", "Moro", "Offa", "Oke Ero", "Oyun", "Pategi"
  ],
  "Lagos": [
    "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", 
    "Eti Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", 
    "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"
  ],
  "Nasarawa": [
    "Akwanga", "Awe", "Doma", "Karu", "Keana", "Keffi", "Kokona", "Lafia", "Nasarawa", 
    "Nasarawa Egon", "Obi", "Toto", "Wamba"
  ],
  "Niger": [
    "Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati", "Gbako", "Gurara", 
    "Katcha", "Kontagora", "Lapai", "Lavun", "Magama", "Mariga", "Mashegu", "Mokwa", "Moya", 
    "Paikoro", "Rafi", "Rijau", "Shiroro", "Suleja", "Tafa", "Wushishi"
  ],
  "Ogun": [
    "Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Egbado North", "Egbado South", 
    "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu North East", "Ijebu Ode", 
    "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside", 
    "Remo North", "Shagamu", "Yewa North", "Yewa South"
  ],
  "Ondo": [
    "Akoko North-East", "Akoko North-West", "Akoko South-West", "Akoko South-East", "Akure North", 
    "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ilaje", "Ile Oluji/Okeigbo", "Irele", 
    "Odigbo", "Okitipupa", "Ondo East", "Ondo West", "Ose", "Owo"
  ],
  "Osun": [
    "Atakunmosa East", "Atakunmosa West", "Aiyedaade", "Aiyedire", "Boluwaduro", "Boripe", 
    "Ede North", "Ede South", "Ife Central", "Ife East", "Ife North", "Ife South", 
    "Ifedayo", "Ifelodun", "Ila", "Ilesa East", "Ilesa West", "Irepodun", "Irewole", "Isokan", 
    "Iwo", "Obokun", "Odo Otin", "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo"
  ],
  "Oyo": [
    "Afijio", "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan North", "Ibadan North-East", 
    "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Ibarapa Central", 
    "Ibarapa East", "Ibarapa North", "Ido", "Irepo", "Iseyin", "Itesiwaju", "Iwajowa", 
    "Kajola", "Lagelu", "Ogbomoso North", "Ogbomoso South", "Ogo Oluwa", "Olorunsogo", 
    "Oluyole", "Ona Ara", "Orelope", "Ori Ire", "Oyo", "Oyo East", "Saki East", "Saki West", 
    "Surulere"
  ],
  "Plateau": [
    "Barkin Ladi", "Bassa", "Bokkos", "Jos East", "Jos North", "Jos South", "Kanam", 
    "Kanke", "Langtang North", "Langtang South", "Mangu", "Mikang", "Pankshin", "Qua'an Pan", 
    "Riyom", "Shendam", "Wase"
  ],
  "Rivers": [
    "Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni", "Asari-Toru", "Bonny", 
    "Degema", "Eleme", "Emuoha", "Etche", "Gokana", "Ikwerre", "Khana", "Obio/Akpor", 
    "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro", "Oyigbo", "Port Harcourt", 
    "Tai"
  ],
  "Sokoto": [
    "Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa", "Illela", 
    "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", "Shagari", "Silame", "Sokoto North", 
    "Sokoto South", "Tambuwal", "Tangaza", "Tureta", "Wamako", "Wurno", "Yabo"
  ],
  "Taraba": [
    "Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo", "Karim Lamido", 
    "Kumi", "Lau", "Sardauna", "Takum", "Ussa", "Wukari", "Yorro", "Zing"
  ],
  "Yobe": [
    "Bade", "Bursari", "Damaturu", "Fika", "Fune", "Geidam", "Gujba", "Gulani", "Jakusko", 
    "Karasuwa", "Machina", "Nangere", "Nguru", "Potiskum", "Tarmuwa", "Yunusari", "Yusufari"
  ],
  "Zamfara": [
    "Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkuyum", "Bungudu", "Gummi", "Kaura Namoda", 
    "Maradun", "Maru", "Shinkafi", "Talata Mafara", "Chafe", "Zurmi"
  ],
  "Federal Capital Territory (Abuja)": [
    "Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"
  ]
};

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, defaultRole = "buyer" }) => {
  const [activeTab, setActiveTab] = useState<"profile" | "address">("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  
  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  
  const queryClient = useQueryClient();

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Show success toast
      setToastMessage("User created successfully!");
      setToastType("success");
      setShowToast(true);
      
      // Auto hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      
      // Reset form
      setFormData({
        user_name: "",
        full_name: "",
        email: "",
        phone: "",
        password: "",
        country: "",
        state: "",
        role: defaultRole,
        referral_code: "",
        profile_picture: null,
      });
      
      // Reset addresses
      setUserAddresses([]);
      setAddressData({
        phoneNumber: "",
        state: "",
        localGovernment: "",
        fullAddress: "",
      });
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    },
    onError: (error: unknown) => {
      console.error('Error creating user:', error);
      
      // Show error toast
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 
                          (error as { message?: string })?.message || 
                          "Failed to create user. Please try again.";
      setToastMessage(errorMessage);
      setToastType("error");
      setShowToast(true);
      
      // Auto hide toast after 5 seconds for errors
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    },
  });

  // Form state
  const [formData, setFormData] = useState({
    user_name: "",
    full_name: "",
    email: "",
    phone: "",
    password: "",
    country: "",
    state: "",
    role: defaultRole as "buyer" | "seller",
    referral_code: "",
    profile_picture: null as File | null,
  });

  // Address form state
  const [addressData, setAddressData] = useState({
    phoneNumber: "",
    state: "",
    localGovernment: "",
    fullAddress: "",
  });

  // User addresses state - starts empty
  const [userAddresses, setUserAddresses] = useState<Array<{
    id: string;
    phoneNumber: string;
    state: string;
    localGovernment: string;
    fullAddress: string;
    isDefault: boolean;
  }>>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      console.log('File selected:', file); // Debug log
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));
    } else {
      const value = (e.target as HTMLInputElement | HTMLSelectElement).value;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddressInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name } = e.target;
    const value = (e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
    
    // If state changes, reset local government
    if (name === 'state') {
      setAddressData((prev) => ({
        ...prev,
        state: value,
        localGovernment: '', // Reset local government when state changes
      }));
    } else {
      setAddressData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Get LGAs for the selected state
  const getLGAsForState = (state: string): string[] => {
    if (!state) return [];
    return STATE_TO_LGAS[state] || [];
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!addressData.phoneNumber || !addressData.state || !addressData.localGovernment || !addressData.fullAddress) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create new address object
    const newAddress = {
      id: Date.now().toString(), // Simple ID generation
      phoneNumber: addressData.phoneNumber,
      state: addressData.state,
      localGovernment: addressData.localGovernment,
      fullAddress: addressData.fullAddress,
      isDefault: userAddresses.length === 0, // First address is default
    };
    
    // Add to addresses array
    setUserAddresses(prev => [...prev, newAddress]);
    
    // Reset form data
    setAddressData({
      phoneNumber: "",
      state: "",
      localGovernment: "",
      fullAddress: "",
    });
    
    // Hide form after submission
    setShowAddAddressForm(false);
    
    // Show success toast
    setToastMessage("Address added successfully!");
    setToastType("success");
    setShowToast(true);
    
    // Auto hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Address management functions
  const handleDeleteAddress = (addressId: string) => {
    setUserAddresses(prev => prev.filter(address => address.id !== addressId));
    
    // If we deleted the default address, make the first remaining address default
    if (userAddresses.length > 1) {
      setUserAddresses(prev => {
        const updated = prev.filter(address => address.id !== addressId);
        if (updated.length > 0) {
          updated[0].isDefault = true;
        }
        return updated;
      });
    }
    
    // Show success toast
    setToastMessage("Address deleted successfully!");
    setToastType("success");
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleEditAddress = (addressId: string) => {
    const addressToEdit = userAddresses.find(addr => addr.id === addressId);
    if (addressToEdit) {
      setAddressData({
        phoneNumber: addressToEdit.phoneNumber,
        state: addressToEdit.state,
        localGovernment: addressToEdit.localGovernment,
        fullAddress: addressToEdit.fullAddress,
      });
      setShowAddAddressForm(true);
      // We'll handle the update in the submit function
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.full_name || !formData.user_name || !formData.email || !formData.phone || !formData.password || !formData.country || !formData.state) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Debug log to check form data
    console.log('Form data being submitted:', formData);
    console.log('Profile picture file:', formData.profile_picture);
    
    // Create user - convert null to undefined for profile_picture
    const userData = {
      ...formData,
        profile_picture: formData.profile_picture || undefined as File | undefined,
    };
    createUserMutation.mutate(userData);
  };

  // Reset addresses when modal is closed
  const handleClose = () => {
    setUserAddresses([]);
    setAddressData({
      phoneNumber: "",
      state: "",
      localGovernment: "",
      fullAddress: "",
    });
    setShowAddAddressForm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] p-3 sticky top-0 bg-white z-10">
          <button
            onClick={handleClose}
            className="absolute flex items-center right-3 cursor-pointer"
          >
            <img src={images.close} alt="Close" />
          </button>
          <h2 className="text-xl font-semibold">Add New User</h2>
        </div>

        <div className="p-5 pb-8">
          {/* Tabs */}
          <div className="flex p-1 gap-4 border border-[#989898] rounded-lg mt-5 w-[275px]">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                activeTab === "profile"
                  ? "bg-[#E53E3E] text-white "
                  : "bg-transparent text-black"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("address")}
              className={`px-6 py-2 rounded-lg font-medium cursor-pointer ${
                activeTab === "address"
                  ? "bg-red-500 text-white"
                  : "bg-transparent text-black"
              }`}
            >
              Saved Address
            </button>
          </div>

          {/* Tab Content */}
          <div className="">
            {activeTab === "profile" && (
              <div className="mt-5">
                {/* Profile tab content goes here */}
                <div className="flex justify-center items-center mt-10 mb-10">
                  <div className="bg-[#EDEDED] rounded-full w-25 h-25 flex justify-center items-center cursor-pointer relative hover:bg-gray-300 transition-colors group">
                    {formData.profile_picture ? (
                      <img
                        src={URL.createObjectURL(formData.profile_picture)}
                        alt="Profile preview"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <img src={images.img} alt="Upload image" />
                        <span className="text-xs text-gray-500 mt-1 group-hover:text-gray-700">
                          Click to upload
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      id="profile_picture_placeholder"
                      name="profile_picture"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username */}
                    <div>
                      <label
                        htmlFor="user_name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Username
                      </label>
                      <input
                        type="text"
                        id="user_name"
                        name="user_name"
                        value={formData.user_name}
                        onChange={handleInputChange}
                        placeholder="Enter username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                        required
                      />
                    </div>

                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="full_name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter password"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                        >
                          {showPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <path d="m2 2 20 20" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Country */}
                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="Enter country"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                        required
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Enter state"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                        required
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                        required
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                      </select>
                    </div>

                    {/* Referral Code */}
                    <div>
                      <label
                        htmlFor="referral_code"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Referral Code (Optional)
                      </label>
                      <input
                        type="text"
                        id="referral_code"
                        name="referral_code"
                        value={formData.referral_code}
                        onChange={handleInputChange}
                        placeholder="Enter referral code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                      />
                    </div>

                    {/* Profile Picture Info */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Click the image above to upload a profile picture (Optional)
                      </p>
                      {formData.profile_picture && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Selected: {formData.profile_picture.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, profile_picture: null }));
                              // Reset file input
                              const fileInput = document.getElementById('profile_picture_placeholder') as HTMLInputElement;
                              if (fileInput) {
                                (fileInput as HTMLInputElement).value = '';
                              }
                            }}
                            className="text-xs text-red-600 hover:text-red-800 underline"
                          >
                            Remove Image
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Add User Button */}
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={createUserMutation.isPending}
                        className="w-full bg-[#E53E3E] text-white py-3 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors font-normal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {createUserMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Creating User...
                          </>
                        ) : (
                          "Add User"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {activeTab === "address" && (
              <div className="mt-5">
                {!showAddAddressForm ? (
                  // Show existing addresses
                  <>
                    {userAddresses.length === 0 ? (
                      // Show empty state when no addresses
                      <div className="text-center py-12">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
                        <p className="text-gray-500 mb-6">Add your first address to get started</p>
                      </div>
                    ) : (
                      // Show existing addresses
                      userAddresses.map((address, index) => (
                        <div key={address.id} className="bg-white border border-[#CDCDCD] rounded-2xl p-4 mb-5">
                          {/* Address Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-800">
                                Address {index + 1}
                              </h3>
                              {address.isDefault && (
                                <span className="bg-[#FF000033] text-[#E53E3E] border border-[#E53E3E] px-3 py-1 rounded-lg text-sm font-medium">
                                  Default Address
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handleEditAddress(address.id)}
                                className="bg-[#E53E3E] text-white px-7 py-2 rounded-full hover:bg-red-600 transition-colors font-medium cursor-pointer"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteAddress(address.id)}
                                className="text-red-500 hover:text-red-700 transition-colors font-medium cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Address Details */}
                          <div className="space-y-3">
                            {/* Phone Number */}
                            <div>
                              <label className="text-gray-500 text-sm block mb-1">
                                Phone number
                              </label>
                              <p className="text-gray-800 font-medium">
                                {address.phoneNumber}
                              </p>
                            </div>

                            {/* State and Local Government */}
                            <div className="flex flex-row gap-10">
                              <div>
                                <label className="text-gray-500 text-sm block mb-1">
                                  State
                                </label>
                                <p className="text-gray-800 font-medium">{address.state}</p>
                              </div>
                              <div>
                                <label className="text-gray-500 text-sm block mb-1">
                                  Local Government
                                </label>
                                <p className="text-gray-800 font-medium">{address.localGovernment}</p>
                              </div>
                            </div>

                            {/* Full Address */}
                            <div>
                              <label className="text-gray-500 text-sm block mb-1">
                                Full Address
                              </label>
                              <p className="text-gray-800 font-medium">
                                {address.fullAddress}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    <div className="mt-6">
                      <button
                        onClick={() => setShowAddAddressForm(true)}
                        className="w-full bg-[#E53E3E] text-white py-3 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors font-normal cursor-pointer"
                      >
                        {userAddresses.length === 0 ? 'Add First Address' : 'Add New Address'}
                      </button>
                    </div>
                  </>
                ) : (
                  // Show add address form
                  <div className="bg-white">
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      {/* Phone Number */}
                      <div>
                        <label
                          htmlFor="addressPhoneNumber"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="addressPhoneNumber"
                          name="phoneNumber"
                          value={addressData.phoneNumber}
                          onChange={handleAddressInputChange}
                          placeholder="Enter phone number"
                          className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                          required
                        />
                      </div>

                      {/* State */}
                      <div>
                        <label
                          htmlFor="state"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          State
                        </label>
                        <div className="relative">
                          <select
                            id="state"
                            name="state"
                            value={addressData.state}
                            onChange={handleAddressInputChange}
                            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow appearance-none bg-white"
                            required
                          >
                            <option value="">Select State</option>
                            <option value="Lagos">Lagos</option>
                            <option value="Abuja">Abuja</option>
                            <option value="Kano">Kano</option>
                            {/* Add more states as needed */}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Local Government */}
                      <div>
                        <label
                          htmlFor="localGovernment"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Local Government
                        </label>
                        <div className="relative">
                          <select
                            id="localGovernment"
                            name="localGovernment"
                            value={addressData.localGovernment}
                            onChange={handleAddressInputChange}
                            disabled={!addressData.state}
                            className={`w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow appearance-none bg-white ${
                              !addressData.state ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            required
                          >
                            <option value="">
                              {addressData.state ? 'Select LGA' : 'Select State first'}
                            </option>
                            {getLGAsForState(addressData.state).map((lga) => (
                              <option key={lga} value={lga}>
                                {lga}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                        {!addressData.state && (
                          <p className="text-xs text-gray-500 mt-1">
                            Please select a state first
                          </p>
                        )}
                      </div>

                      {/* Full Address */}
                      <div>
                        <label
                          htmlFor="fullAddress"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Full Address
                        </label>
                        <textarea
                          id="fullAddress"
                          name="fullAddress"
                          value={addressData.fullAddress}
                          onChange={handleAddressInputChange}
                          placeholder="Enter full address"
                          rows={4}
                          className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow resize-none"
                          required
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddAddressForm(false);
                            // Reset form data when canceling
                            setAddressData({
                              phoneNumber: "",
                              state: "",
                              localGovernment: "",
                              fullAddress: "",
                            });
                          }}
                          className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 focus:outline-none transition-colors font-normal cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-[#E53E3E] text-white py-3 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors font-normal cursor-pointer"
                        >
                          Save Address
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] ${
            toastType === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              toastType === 'success' ? 'bg-white' : 'bg-white'
            }`}>
              {toastType === 'success' ? (
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {toastType === 'success' ? 'Success!' : 'Error!'}
              </p>
              <p className="text-sm opacity-90">{toastMessage}</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUserModal;
