"use client";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
  RadioGroup,
  HStack,
  Switch,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { authUrl, configHeader } from "./utils";

const OverlayOne = () => (
  <ModalOverlay
    bg="blackAlpha.300"
    backdropFilter="blur(10px) hue-rotate(90deg)"
  />
);

export default function Page() {
  const [users, setUsers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [overlay, setOverlay] = useState(<OverlayOne />);
  const [apiResponse, setApiResponse] = useState(null);
  const [getNewUser, setGetNewUser] = useState(true);

  const initialFormData = {
    name: "",
    email: "",
    gender: "male",
    status: true, // true for active, false for inactive
  };

  const [formData, setFormData] = useState(initialFormData);

  const router = useRouter();
  const cardBg = useColorModeValue("white", "gray.800");
  const cardHoverBg = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    gender: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (value) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: false }));
    }
  };

  const handleGenderChange = (value) => {
    setFormData((prevData) => ({ ...prevData, gender: value }));
    if (value) {
      setErrors((prevErrors) => ({ ...prevErrors, gender: false }));
    }
  };

  const handleStatusChange = (e) => {
    setFormData((prevData) => ({ ...prevData, status: e.target.checked }));
  };

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await fetch(
          `${authUrl}/users`,
          {
            method: "GET",
            headers: configHeader,
          }
        );
        const data = await response.json();
        if (response.ok) {
          setUsers(data);
          setTimeout(() => {
            setGetNewUser(false);
          }, 500)
        } else {
          console.error("Failed to fetch user posts data:", data);
        }
      } catch (error) {
        console.error("Error fetching user posts data:", error);
      }
    };

    if (getNewUser) {
      fetchUserPosts();
    }
  }, [getNewUser]);

  const renderAddUserModal = () => {
    handleCloseModal()
    setOverlay(<OverlayOne />);
    onOpen();
  };

  const handleAddUser = () => {
    const { name, email, gender } = formData;
    const newErrors = {
      name: name === "",
      email: email === "",
      gender: gender === "",
    };

    if (newErrors.name || newErrors.email || newErrors.gender) {
      setErrors(newErrors);
      return;
    }

    fetch(`${authUrl}/users`, {
      method: "POST",
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        gender: formData.gender,
        status: formData.status ? "active" : "inactive",
      }),
      headers: configHeader,
    })
      .then((response) => response.json())
      .then((data) => {
        const { field = '', message = '' } = data?.[0] || {};
        setApiResponse({ success: true, message: `${field} ${message}`.trim() || "User added successfully", isError: field?.length ? true : false });
        // Clear form fields
        if (!field?.length) {
          setFormData(initialFormData);
        }
        setGetNewUser(true);
      })
  };

  const handleCloseModal = () => {
    onClose();
    setApiResponse({ success: true, message: "", isError: false });
    setFormData(initialFormData);
  }

  const handleUserDetails = (item) => {
    localStorage.setItem("userData", JSON.stringify(item));
    router.push(`/user/${item?.id}`);
  }

  const renderUsers = () => {
    return users?.map((item) => (
      <Card
        onClick={() => handleUserDetails(item)}
        cursor="pointer"
        bg={cardBg}
        _hover={{ bg: cardHoverBg, transform: "scale(1.02)" }}
        transition="all 0.2s"
        shadow="md"
        borderRadius="md"
        p={4}
      >
        <CardHeader>
          <Stack direction="row" spacing={4} align="center">
            <Avatar name={item?.name} src="https://bit.ly/broken-link" />
            <Heading size="md">{item?.name}</Heading>
          </Stack>
        </CardHeader>
        <CardBody>
          <Text color={textColor}>Email: {item?.email}</Text>
          <Text color={textColor}>Gender: {item?.gender}</Text>
          <Text color={textColor}>
            Status:{" "}
            {item?.status === "active" ? (
              <Box as="span" color="green.500">
                active
              </Box>
            ) : (
              <Box as="span" color="red.500">
                inactive
              </Box>
            )}
          </Text>
        </CardBody>
      </Card>
    ));
  };

  const renderHeader = () => {
    return (
      <>
        <Box w="100%" display="flex" justifyContent="flex-end">
          <Button
            colorScheme="green"
            variant="solid"
            onClick={renderAddUserModal}
          >
            + Add User
          </Button>
        </Box>
        <Modal
          isCentered
          isOpen={isOpen}
          onClose={onClose}
        >
          {overlay}
          <ModalContent>
            <ModalHeader>Create your account</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl isInvalid={errors.name}>
                <FormLabel>Name</FormLabel>
                <Input
                  // ref={initialRef}
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <FormErrorMessage>Name is required.</FormErrorMessage>
                )}
              </FormControl>
              <FormControl isInvalid={errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  // ref={initialRef}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your Email"
                />
                {errors.email && (
                  <FormErrorMessage>Email is required.</FormErrorMessage>
                )}
              </FormControl>
              <FormControl as="fieldset" isInvalid={errors.gender}>
                <FormLabel as="legend">Gender</FormLabel>
                <RadioGroup
                  value={formData.gender}
                  onChange={handleGenderChange}
                >
                  <HStack spacing="24px">
                    <Radio value="male">Male</Radio>
                    <Radio value="female">Female</Radio>
                    <Radio value="others">Others</Radio>
                  </HStack>
                </RadioGroup>
                {errors.gender && (
                  <FormErrorMessage>Gender is required.</FormErrorMessage>
                )}
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="status-switch" mb="0">
                  Status
                </FormLabel>
                <Switch
                  id="status-switch"
                  isChecked={formData.status}
                  onChange={handleStatusChange}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Box display="flex" alignItems="center"
                justifyContent="space-between" w="100%">
                <Box>
                  {apiResponse && (
                    <VStack align="flex-start" mb={4}>
                      <Text color={!apiResponse?.isError ? "green.500" : "red.500"}>
                        {apiResponse?.message}
                      </Text>
                    </VStack>
                  )}
                </Box>
                <Box>
                  <Button colorScheme="blue" mr={3} onClick={handleAddUser}>
                    Save
                  </Button>
                  <Button onClick={handleCloseModal}>Cancel</Button>
                </Box>
              </Box>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  };

  return (
    <>
      <Box
        w="100%"
        h="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="20px"
        padding="20px"
      >
        {renderHeader()}
        <Box w={{ sm: "100%", lg: "70%" }} h="100%" padding="40px">
          <SimpleGrid
            spacing={6}
            templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
          >
            {renderUsers()}
          </SimpleGrid>
        </Box>
      </Box>
    </>
  );
}
