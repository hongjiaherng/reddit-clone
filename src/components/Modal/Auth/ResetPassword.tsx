import { Button, Flex, Icon, Input, Text } from '@chakra-ui/react';
import { BsDot, BsReddit } from "react-icons/bs";
import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { authModalState } from '../../../atoms/authModalAtom';
import { useSendPasswordResetEmail } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebase/clientApp';
import { FIREBASE_ERRORS } from '../../../firebase/errors';

const ResetPassword: React.FC = () => {
    const setAuthModalState = useSetRecoilState(authModalState);
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);
    const [sendPasswordResetEmail, sending, error] = useSendPasswordResetEmail(auth);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await sendPasswordResetEmail(email);

        if (error) {
            console.log(error);
            setSuccess(false);
        } else {
            setSuccess(true)
        }
    };

    return (
        <Flex direction="column" alignItems="center" width="100%">
            <Icon as={BsReddit} color="brand.100" fontSize={40} mb={2} />
            <Text fontWeight={700} mb={2}>
                Reset your password
            </Text>
            {success ? (
                <Text mb={4}>Check your email o(≧▽≦)o</Text>
            ) : (
                <>
                    <Text fontSize="sm" textAlign="center" mb={2}>
                        Enter the email associated with your account and we will send you a reset link
                    </Text><form onSubmit={onSubmit} style={{ width: "100%" }}>
                        <Input
                            required
                            name="email"
                            placeholder="email"
                            type="email"
                            mb={2}
                            onChange={(event) => setEmail(event.target.value)}
                            fontSize="10pt"
                            _placeholder={{ color: "gray.500" }}
                            _hover={{
                                bg: "white",
                                border: "1px solid",
                                borderColor: "blue.500"
                            }}
                            _focus={{
                                outline: "none",
                                bg: "white",
                                border: "1px solid",
                                borderColor: "blue.500"
                            }}
                            bg="gray.50" />
                        <Text textAlign="center" fontSize="10pt" color="red">{FIREBASE_ERRORS[error?.message as keyof typeof FIREBASE_ERRORS]}</Text>
                        <Button
                            width="100%"
                            height="36px"
                            mb={2}
                            mt={2}
                            type="submit"
                            isLoading={sending}
                        >
                            Reset Password
                        </Button>
                    </form></>
            )}


            <Flex alignItems="center" fontSize="9pt" color="blue.500" fontWeight={700} cursor="pointer">
                <Text onClick={() => setAuthModalState((prev) => ({
                    ...prev,
                    view: "login",
                }))}>
                    LOGIN
                </Text>
                <Icon as={BsDot} />
                <Text onClick={() => setAuthModalState((prev) => ({
                    ...prev,
                    view: "signup",
                }))}>
                    SIGN UP
                </Text>
            </Flex>
        </Flex>
    );
}
export default ResetPassword;