import { WebsiteItemCards } from "./components";
import { Flex, Heading } from "@radix-ui/themes";

export default function Home() {
  return (
    <Flex direction="column" gap="5" mt="8">
      <Heading>内网资源</Heading>
      <WebsiteItemCards />
    </Flex>
  );
}
