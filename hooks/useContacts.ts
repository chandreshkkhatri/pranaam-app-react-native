import { useEffect, useState } from "react";
import * as Contacts from "expo-contacts";
import { parsePhoneNumber, E164Number } from "libphonenumber-js/min";
import { supabase } from "../lib/supabase";
import { normalise } from "../utils/phone";

export type Registered = { id: string; phone: string };

export default function useContacts(languageCode: "en" | "hi") {
  const [deviceContacts, setDeviceContacts] = useState<Contacts.Contact[]>([]);
  const [registered, setRegistered] = useState<Map<string, Registered>>(
    new Map()
  );

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") return;

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });
      const contacts = data.filter((c) => c.name && c.phoneNumbers?.length);
      setDeviceContacts(contacts);

      const numbers = contacts
        .flatMap((c) => c.phoneNumbers ?? [])
        .map((p) => p.number)
        .filter((n): n is string => !!n)
        .map((n) => {
          try {
            return parsePhoneNumber(n, "IN")?.number ?? null;
          } catch {
            return null;
          }
        })
        .filter((n): n is E164Number => !!n);

      if (numbers.length === 0) return;

      const { data: rows } = await supabase
        .from("profiles")
        .select("id, phone_e164")
        .in("phone_e164", numbers);

      const map = new Map<string, Registered>();
      rows?.forEach((r) => {
        map.set(normalise(r.phone_e164), {
              id: r.id,
              phone: r.phone_e164,
            })
      });            
      setRegistered(map);
    })();
  }, [languageCode]);

  return { deviceContacts, registered };
}