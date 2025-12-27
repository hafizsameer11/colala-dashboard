import images from "../constants/images";
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { updateUser, createUserAddress, updateUserAddress, deleteUserAddress } from "../utils/mutations/users";
import { getUserAddresses } from "../utils/queries/users";
import { useToast } from "../contexts/ToastContext";

interface Address {
  id: number;
  label?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  local_government?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  is_default?: boolean;
  created_at?: string;
  formatted_date?: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: any;
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

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, userData }) => {
  const [activeTab, setActiveTab] = useState<"profile" | "address">("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch user addresses
  const { data: addressesData, isLoading: isLoadingAddresses, error: addressesError, refetch: refetchAddresses } = useQuery({
    queryKey: ['userAddresses', userData?.user_info?.id],
    queryFn: () => getUserAddresses(userData?.user_info?.id),
    enabled: !!userData?.user_info?.id && activeTab === "address",
    staleTime: 0, // Always refetch to get latest data
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allUsersStats'] });
      queryClient.invalidateQueries({ queryKey: ['userDetails'] });
      queryClient.invalidateQueries({ queryKey: ['userAddresses'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      showToast('Failed to update user', 'error');
    },
  });

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: ({ userId, addressData }: { userId: number | string; addressData: any }) =>
      createUserAddress(userId, addressData),
    onSuccess: async () => {
      // Close form first
      setShowAddAddressForm(false);
      setAddressData({ phoneNumber: "", state: "", localGovernment: "", fullAddress: "" });
      setEditingAddressId(null);
      
      // Invalidate and refetch addresses to show updated values
      queryClient.invalidateQueries({ queryKey: ['userAddresses', userData?.user_info?.id] });
      await refetchAddresses();
      
      showToast('Address created successfully!', 'success');
    },
    onError: (error: any) => {
      console.error('Error creating address:', error);
      showToast('Failed to create address', 'error');
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: ({ userId, addressId, addressData }: { userId: number | string; addressId: number | string; addressData: any }) => {
      console.log('Update mutation called with:', { userId, addressId, addressData });
      return updateUserAddress(userId, addressId, addressData);
    },
    onSuccess: async () => {
      // Close form first
      setShowAddAddressForm(false);
      setAddressData({ phoneNumber: "", state: "", localGovernment: "", fullAddress: "" });
      setEditingAddressId(null);
      
      // Invalidate and refetch addresses to show updated values
      queryClient.invalidateQueries({ queryKey: ['userAddresses', userData?.user_info?.id] });
      await refetchAddresses();
      
      showToast('Address updated successfully!', 'success');
    },
    onError: (error: any) => {
      console.error('Error updating address:', error);
      showToast('Failed to update address', 'error');
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: ({ userId, addressId }: { userId: number | string; addressId: number | string }) =>
      deleteUserAddress(userId, addressId),
    onSuccess: async () => {
      // Invalidate and refetch addresses to show updated values
      queryClient.invalidateQueries({ queryKey: ['userAddresses', userData?.user_info?.id] });
      await refetchAddresses();
      showToast('Address deleted successfully!', 'success');
    },
    onError: (error: any) => {
      console.error('Error deleting address:', error);
      showToast('Failed to delete address', 'error');
    },
  });

  // Form state - initialize with user data
  const [formData, setFormData] = useState({
    user_name: "",
    full_name: "",
    email: "",
    phone: "",
    password: "",
    country: "",
    state: "",
    role: "buyer" as "buyer" | "seller",
    status: "active" as "active" | "inactive",
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

  // Initialize form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        user_name: userData.user_info?.user_name || userData.user_info?.full_name || "",
        full_name: userData.user_info?.full_name || "",
        email: userData.user_info?.email || "",
        phone: userData.user_info?.phone || "",
        password: "", // Don't pre-fill password for security
        country: userData.user_info?.country || "",
        state: userData.user_info?.state || "",
        role: userData.user_info?.role || "buyer",
        status: userData.user_info?.status || "active",
        referral_code: "",
        profile_picture: null,
      });
    }
  }, [userData]);

  // Reset address form state when modal closes or tab changes
  useEffect(() => {
    if (!isOpen) {
      // Reset all address-related state when modal closes
      setShowAddAddressForm(false);
      setEditingAddressId(null);
      setAddressData({ phoneNumber: "", state: "", localGovernment: "", fullAddress: "" });
    }
  }, [isOpen]);

  // Reset address form when switching tabs
  useEffect(() => {
    if (activeTab !== "address") {
      // Reset address form when switching away from address tab
      setShowAddAddressForm(false);
      setEditingAddressId(null);
      setAddressData({ phoneNumber: "", state: "", localGovernment: "", fullAddress: "" });
    }
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;
    const type = target.type;
    
    if (type === 'file') {
      const fileInput = target as HTMLInputElement;
      const file = fileInput.files?.[0] || null;
      console.log('File selected:', file); // Debug log
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));
    } else {
      const value = 'value' in target ? target.value : '';
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
    const target = e.target;
    const name = target.name;
    const value = 'value' in target ? target.value : '';
    
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
    
    if (!userData?.user_info?.id) {
      showToast('User ID not found', 'error');
      return;
    }

    if (!addressData.phoneNumber || !addressData.state || !addressData.localGovernment || !addressData.fullAddress) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Split full address into line1 and line2 if it contains a comma
    // Otherwise, put everything in line1
    const addressLines = addressData.fullAddress.split(',').map(line => line.trim());
    const addressPayload = {
      phone: addressData.phoneNumber,
      state: addressData.state,
      city: addressData.localGovernment, // API stores local government in 'city' field
      local_government: addressData.localGovernment, // Keep both for compatibility
      line1: addressLines[0] || addressData.fullAddress, // First part or entire address
      line2: addressLines.length > 1 ? addressLines.slice(1).join(', ') : undefined, // Rest if multiple parts
    };

    // Debug: Log the editing state
    console.log('Address Submit - editingAddressId:', editingAddressId);
    console.log('Address Payload:', addressPayload);

    if (editingAddressId !== null && editingAddressId !== undefined) {
      // Update existing address
      console.log('Updating address with ID:', editingAddressId);
      updateAddressMutation.mutate({
        userId: userData.user_info.id,
        addressId: editingAddressId,
        addressData: addressPayload,
      });
    } else {
      // Create new address
      console.log('Creating new address');
      createAddressMutation.mutate({
        userId: userData.user_info.id,
        addressData: addressPayload,
      });
    }
  };

  const handleEditAddress = (address: Address) => {
    // Properly construct fullAddress by combining line1 and line2
    let fullAddress = "";
    if (address.line1) {
      fullAddress = address.line1;
      if (address.line2) {
        fullAddress = `${address.line1}, ${address.line2}`;
      }
    }
    
    // API stores local government in 'city' field, so prioritize city over local_government
    const localGovernmentValue = address.city || address.local_government || "";
    
    // Debug: Log the address being edited
    console.log('Editing address:', address);
    console.log('Setting editingAddressId to:', address.id);
    
    setAddressData({
      phoneNumber: address.phone || "",
      state: address.state || "",
      localGovernment: localGovernmentValue,
      fullAddress: fullAddress,
    });
    setEditingAddressId(address.id);
    setShowAddAddressForm(true);
  };

  const handleDeleteAddress = (addressId: number) => {
    if (!userData?.user_info?.id) {
      showToast('User ID not found', 'error');
      return;
    }

    if (window.confirm("Are you sure you want to delete this address?")) {
      deleteAddressMutation.mutate({
        userId: userData.user_info.id,
        addressId: addressId,
      });
    }
  };

  const handleCancelAddressForm = () => {
    setShowAddAddressForm(false);
    setAddressData({ phoneNumber: "", state: "", localGovernment: "", fullAddress: "" });
    setEditingAddressId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.full_name || !formData.email || !formData.phone || !formData.country || !formData.state) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Debug log to check form data
    console.log('Form data being submitted:', formData);
    console.log('Profile picture file:', formData.profile_picture);
    
    // Update user - only include profile_picture if it's a File
    const updateData = {
      userId: userData?.user_info?.id,
      full_name: formData.full_name,
      user_name: formData.user_name,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      state: formData.state,
      role: formData.role,
      status: formData.status,
      referral_code: formData.referral_code,
      ...(formData.password && { password: formData.password }),
      ...(formData.profile_picture && { profile_picture: formData.profile_picture }),
    };
    
    updateUserMutation.mutate(updateData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#00000080] bg-opacity-50 flex justify-end">
      <div className="bg-white w-[500px] relative h-full overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#787878] p-3 sticky top-0 bg-white z-10">
          <button
            onClick={onClose}
            className="absolute flex items-center right-3 cursor-pointer"
          >
            <img src={images.close} alt="Close" />
          </button>
          <h2 className="text-xl font-semibold">Edit User</h2>
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
                    ) : userData?.user_info?.profile_picture ? (
                      <img
                        src={`https://colala.hmstech.xyz/storage/${userData.user_info.profile_picture}`}
                        alt="Current profile"
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
                        Password (Leave blank to keep current password)
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter new password (optional)"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
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

                    {/* Status */}
                    <div>
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
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
                        Click the image above to upload a new profile picture (Optional)
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
                              const fileInput = document.getElementById('profile_picture_placeholder') as HTMLInputElement | null;
                              if (fileInput && 'value' in fileInput) {
                                fileInput.value = '';
                              }
                            }}
                            className="text-xs text-red-600 hover:text-red-800 underline"
                          >
                            Remove Image
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Update User Button */}
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={updateUserMutation.isPending}
                        className="w-full bg-[#E53E3E] text-white py-3 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors font-normal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {updateUserMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Updating User...
                          </>
                        ) : (
                          "Update User"
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
                    {isLoadingAddresses ? (
                      // Loading State
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E53E3E] mb-4"></div>
                        <p className="text-gray-600 text-sm">Loading addresses...</p>
                      </div>
                    ) : addressesError ? (
                      // Error State
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600 text-sm">
                          Error loading addresses. Please try again.
                        </p>
                      </div>
                    ) : addressesData?.data?.addresses && addressesData.data.addresses.length > 0 ? (
                      // Addresses List
                      <div className="space-y-4">
                        {addressesData.data.addresses.map((address: Address, index: number) => (
                          <div key={address.id || index} className="bg-white border border-[#CDCDCD] rounded-2xl p-4">
                            {/* Address Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {address.label || `Address ${index + 1}`}
                                </h3>
                                {address.is_default && (
                                  <span className="bg-[#FF000033] text-[#E53E3E] border border-[#E53E3E] px-3 py-1 rounded-lg text-sm font-medium">
                                    Default Address
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => handleEditAddress(address)}
                                  disabled={deleteAddressMutation.isPending || updateAddressMutation.isPending}
                                  className="bg-[#E53E3E] text-white px-7 py-2 rounded-full hover:bg-red-600 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteAddress(address.id)}
                                  disabled={deleteAddressMutation.isPending || updateAddressMutation.isPending}
                                  className="text-red-500 hover:text-red-700 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {deleteAddressMutation.isPending ? 'Deleting...' : 'Delete'}
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
                                  {address.phone || 'N/A'}
                                </p>
                              </div>

                              {/* State and Local Government */}
                              <div className="flex flex-row gap-10">
                                <div>
                                  <label className="text-gray-500 text-sm block mb-1">
                                    State
                                  </label>
                                  <p className="text-gray-800 font-medium">
                                    {address.state || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-gray-500 text-sm block mb-1">
                                    Local Government
                                  </label>
                                  <p className="text-gray-800 font-medium">
                                    {address.city || address.local_government || 'N/A'}
                                  </p>
                                </div>
                              </div>

                              {/* Full Address */}
                              <div>
                                <label className="text-gray-500 text-sm block mb-1">
                                  Full Address
                                </label>
                                <p className="text-gray-800 font-medium">
                                  {address.line1 || 'N/A'}
                                  {address.line2 && `, ${address.line2}`}
                                  {address.zipcode && ` - ${address.zipcode}`}
                                </p>
                              </div>

                              {/* Country */}
                              {address.country && (
                                <div>
                                  <label className="text-gray-500 text-sm block mb-1">
                                    Country
                                  </label>
                                  <p className="text-gray-800 font-medium">
                                    {address.country}
                                  </p>
                                </div>
                              )}

                              {/* Created Date */}
                              {address.formatted_date && (
                                <div>
                                  <label className="text-gray-500 text-sm block mb-1">
                                    Added on
                                  </label>
                                  <p className="text-gray-800 font-medium text-sm">
                                    {address.formatted_date}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Empty State
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-600 text-sm mb-4">
                          No saved addresses found for this user.
                        </p>
                      </div>
                    )}

                    <div className="mt-6">
                      <button
                        onClick={() => {
                          setEditingAddressId(null);
                          setAddressData({ phoneNumber: "", state: "", localGovernment: "", fullAddress: "" });
                          setShowAddAddressForm(true);
                        }}
                        className="w-full bg-[#E53E3E] text-white py-3 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors font-normal cursor-pointer"
                      >
                        Add New Address
                      </button>
                    </div>
                  </>
                ) : (
                  // Show add/edit address form
                  <div className="bg-white">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {editingAddressId ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      {editingAddressId && (
                        <p className="text-sm text-gray-500 mt-1">
                          Update the address information below
                        </p>
                      )}
                    </div>
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
                            <option value="Abia">Abia</option>
                            <option value="Adamawa">Adamawa</option>
                            <option value="Akwa Ibom">Akwa Ibom</option>
                            <option value="Anambra">Anambra</option>
                            <option value="Bauchi">Bauchi</option>
                            <option value="Bayelsa">Bayelsa</option>
                            <option value="Benue">Benue</option>
                            <option value="Borno">Borno</option>
                            <option value="Cross River">Cross River</option>
                            <option value="Delta">Delta</option>
                            <option value="Ebonyi">Ebonyi</option>
                            <option value="Edo">Edo</option>
                            <option value="Ekiti">Ekiti</option>
                            <option value="Enugu">Enugu</option>
                            <option value="Gombe">Gombe</option>
                            <option value="Imo">Imo</option>
                            <option value="Jigawa">Jigawa</option>
                            <option value="Kaduna">Kaduna</option>
                            <option value="Kano">Kano</option>
                            <option value="Katsina">Katsina</option>
                            <option value="Kebbi">Kebbi</option>
                            <option value="Kogi">Kogi</option>
                            <option value="Kwara">Kwara</option>
                            <option value="Lagos">Lagos</option>
                            <option value="Nasarawa">Nasarawa</option>
                            <option value="Niger">Niger</option>
                            <option value="Ogun">Ogun</option>
                            <option value="Ondo">Ondo</option>
                            <option value="Osun">Osun</option>
                            <option value="Oyo">Oyo</option>
                            <option value="Plateau">Plateau</option>
                            <option value="Rivers">Rivers</option>
                            <option value="Sokoto">Sokoto</option>
                            <option value="Taraba">Taraba</option>
                            <option value="Yobe">Yobe</option>
                            <option value="Zamfara">Zamfara</option>
                            <option value="Abuja">Federal Capital Territory (Abuja)</option>
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
                          onClick={handleCancelAddressForm}
                          disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                          className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 focus:outline-none transition-colors font-normal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                          className="flex-1 bg-[#E53E3E] text-white py-3 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors font-normal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {createAddressMutation.isPending || updateAddressMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              {editingAddressId ? 'Updating...' : 'Creating...'}
                            </>
                          ) : (
                            editingAddressId ? 'Update Address' : 'Save Address'
                          )}
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
    </div>
  );
};

export default EditUserModal;
