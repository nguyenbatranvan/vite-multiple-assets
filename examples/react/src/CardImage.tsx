import {ComponentProps, FC, ReactNode} from "react";
import {Card, Grid, Text} from "@mantine/core";
import {ColProps} from "@mantine/core/lib/Grid/Col/Col";

interface IProps {
    col?: ColProps;
    titleCard: ReactNode;
    description?: ReactNode;
    images: ComponentProps<'img'>[];
    children?: ReactNode;
}

export const CardImage: FC<IProps> = (props) => {
    const {col, titleCard, images, description, children} = props;
    return <Grid.Col span={6} {...col}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section withBorder inheritPadding py="xs">
                <Text fw={500}>{titleCard}</Text>
            </Card.Section>
            <Text mt="sm" c="dimmed" size="sm">
                <Text span inherit c="var(--mantine-color-anchor)">
                    {description}
                </Text>
            </Text>
            {images.map((image, index) => <img key={index} {...image}/>)}
            {children}
        </Card>
    </Grid.Col>
};
