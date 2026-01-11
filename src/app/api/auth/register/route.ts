import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { firstname, lastname, email, password, phone } = body;

        if (!firstname || !lastname || !password || !email || !phone) {
            return NextResponse.json(
                { message: "Tous les champs sont requis" },
                { status: 400 }
            );
        }

        // 2. Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phone: phone },
                ],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Cet email/telephone est déjà utilisé" },
                { status: 409 } // Conflit
            );
        }

        // 3. Chiffrer le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Créer l'utilisateur dans la BDD
        const newUser = await prisma.user.create({
            data: {
                firstname,
                lastname,
                email,
                phone,
                password: hashedPassword,
            },
        });

        // On ne renvoie pas le mot de passe, même haché !
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(
            { message: "Compte créé avec succès", user: userWithoutPassword },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            { message: "Erreur serveur lors de l'inscription", error },
            { status: 500 }
        );
    }
}